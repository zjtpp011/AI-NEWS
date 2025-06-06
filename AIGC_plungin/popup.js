// AI工具数据
const aiTools = [
    {
        name: "ChatGPT",
        description: "OpenAI开发的大型语言模型，可以进行自然语言对话和创作",
        logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
        url: "https://chat.openai.com",
        category: "text"
    },
    {
        name: "Midjourney",
        description: "AI图像生成工具，可以创建高质量的艺术作品",
        logo: "https://cdn.midjourney.com/logo.png",
        url: "https://www.midjourney.com",
        category: "image"
    },
    {
        name: "Runway",
        description: "AI视频编辑工具，支持视频生成和编辑",
        logo: "https://runwayml.com/logo.png",
        url: "https://runwayml.com",
        category: "video"
    },
    {
        name: "Stable Diffusion",
        description: "开源的AI图像生成模型，可以创建各种风格的图片",
        logo: "https://stability.ai/logo.png",
        url: "https://stability.ai",
        category: "image"
    }
];

// 全局变量
let articles = [];
let tools = [];
let currentToolCategory = 'all';
let searchQuery = '';

// 获取工具分类
function getUniqueCategories(items) {
    const categories = new Set(items.map(item => item.category));
    return Array.from(categories);
}

// 初始化工具分类标签
function initToolTabs() {
    const tabsContainer = document.querySelector('.tools-tabs');
    if (!tabsContainer) return;

    // 获取所有分类
    const categories = getUniqueCategories(tools);
    
    // 创建标签按钮
    const tabs = [
        {
            category: 'all',
            text: '全部'
        },
        ...categories.map(category => ({
            category,
            text: category === 'text' ? '文本' : 
                  category === 'image' ? '图像' : 
                  category === 'video' ? '视频' : 
                  category === '3d' ? '3D' : category
        }))
    ].map(({ category, text }) => {
        const button = document.createElement('button');
        button.className = 'tools-tab';
        button.textContent = text;
        button.dataset.category = category;
        if (category === currentToolCategory) {
            button.classList.add('active');
        }
        return button;
    });

    // 清空并添加新标签
    tabsContainer.innerHTML = '';
    tabs.forEach(tab => tabsContainer.appendChild(tab));

    // 添加点击事件
    tabsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tools-tab')) {
            // 更新当前分类
            currentToolCategory = e.target.dataset.category;
            
            // 更新标签样式
            tabsContainer.querySelectorAll('.tools-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            e.target.classList.add('active');
            
            // 重新渲染工具
            filterAndRenderTools();
        }
    });
}

// 过滤并渲染工具
function filterAndRenderTools() {
    const filteredTools = tools.filter(tool => {
        const matchesCategory = currentToolCategory === 'all' || tool.category === currentToolCategory;
        const matchesSearch = !searchQuery || 
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    
    renderTools(filteredTools);
}

// 渲染工具卡片
function renderTools(tools) {
    const toolsGrid = document.querySelector('.tools-grid');
    if (!toolsGrid) return;

    if (tools.length === 0) {
        toolsGrid.innerHTML = '<div class="no-content">没有找到相关工具</div>';
        return;
    }

    toolsGrid.innerHTML = tools.map(tool => `
        <div class="tool-card" data-url="${tool.url}">
            <img src="${tool.logo}" alt="${tool.name}" class="tool-icon">
            <h3 class="tool-name">${tool.name}</h3>
            <p class="tool-description">${tool.description}</p>
        </div>
    `).join('');

    // 添加点击事件
    toolsGrid.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => {
            chrome.tabs.create({ url: card.dataset.url });
        });
    });
}

// 初始化轮播
function initCarousel() {
    const slidesContainer = document.querySelector('.carousel-slides');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    if (!slidesContainer || !indicatorsContainer) return;

    // 确保 articles 是数组
    if (!Array.isArray(articles)) {
        console.error('Articles data is not an array');
        return;
    }

    // 创建轮播内容
    slidesContainer.innerHTML = articles.map((article, index) => `
        <div class="carousel-slide ${index === 0 ? 'active' : ''}">
            <img src="${article.image}" alt="${article.title}">
            <div class="carousel-content">
                <h3 class="carousel-title">${article.title}</h3>
                <p class="carousel-description">${article.description}</p>
            </div>
        </div>
    `).join('');

    // 创建指示器
    indicatorsContainer.innerHTML = articles.map((_, index) => `
        <div class="indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
    `).join('');

    // 添加轮播控制
    let currentSlide = 0;
    const slides = slidesContainer.querySelectorAll('.carousel-slide');
    const indicators = indicatorsContainer.querySelectorAll('.indicator');
    let autoPlayInterval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    // 自动轮播
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    // 添加指示器点击事件
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', (e) => {
            e.stopPropagation();
            stopAutoPlay();
            showSlide(index);
            startAutoPlay();
        });
    });

    // 添加图片点击事件
    slides.forEach((slide, index) => {
        slide.addEventListener('click', () => {
            chrome.tabs.create({ url: articles[index].url });
        });
    });

    // 开始自动轮播
    startAutoPlay();
}

// 初始化搜索
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        filterAndRenderTools();
    });
}

// 显示错误信息
function showError(message) {
    const errorContainer = document.querySelector('.error-container');
    const errorMessage = errorContainer.querySelector('p');
    if (errorContainer && errorMessage) {
        errorMessage.textContent = message;
        errorContainer.style.display = 'block';
    }
}

// 隐藏错误信息
function hideError() {
    const errorContainer = document.querySelector('.error-container');
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
}

// 初始化应用
async function init() {
    try {
        // 加载数据
        const [articlesResponse, toolsResponse] = await Promise.all([
            fetch(chrome.runtime.getURL('data/articles.json')),
            fetch(chrome.runtime.getURL('data/tools.json'))
        ]);

        if (!articlesResponse.ok || !toolsResponse.ok) {
            throw new Error('数据加载失败');
        }

        const articlesData = await articlesResponse.json();
        const toolsData = await toolsResponse.json();

        // 确保数据是数组
        articles = Array.isArray(articlesData) ? articlesData : articlesData.articles || [];
        tools = Array.isArray(toolsData) ? toolsData : toolsData.tools || [];

        if (!Array.isArray(articles) || !Array.isArray(tools)) {
            throw new Error('数据格式错误');
        }

        // 初始化界面
        initCarousel();
        initToolTabs();
        initSearch();
        filterAndRenderTools();
        hideError();
    } catch (error) {
        console.error('初始化失败:', error);
        showError('加载失败，请重试');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init); 