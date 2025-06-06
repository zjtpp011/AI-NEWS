// 监听插件安装
chrome.runtime.onInstalled.addListener(() => {
    console.log('插件已安装');
});

// 解析文章数据
function parseArticles(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const articles = [];
    
    // 获取所有文章元素
    const articleElements = doc.querySelectorAll('.a_scale');
    
    articleElements.forEach(element => {
        try {
            // 获取文章链接
            const linkElement = element.querySelector('a');
            if (!linkElement) return;
            
            // 获取图片元素
            const imageElement = element.querySelector('.thumb');
            if (!imageElement) return;
            
            // 从style属性中提取图片URL
            const imageUrl = imageElement.style.backgroundImage
                .replace(/url\(['"](.+)['"]\)/, '$1')
                .replace(/^https?:\/\/image\.uisdc\.com\//, 'https://image.uisdc.com/');
            
            // 构建文章对象
            const article = {
                title: element.getAttribute('title') || '',
                url: linkElement.href,
                image: imageUrl,
                date: '',  // 需要从其他元素获取
                views: '', // 需要从其他元素获取
                category: 'AI',
                description: '' // 需要从其他元素获取
            };
            
            // 只添加有效的文章
            if (article.url && article.image) {
                articles.push(article);
            }
        } catch (error) {
            console.error('解析文章时出错:', error);
        }
    });
    
    return articles;
}

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'fetchArticles') {
        console.log('开始获取文章数据...');
        
        fetch('https://www.uisdc.com/u/716521/publish/all', {
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            console.log('成功获取HTML内容');
            const articles = parseArticles(html);
            console.log(`解析到 ${articles.length} 篇文章`);
            
            // 存储文章数据
            chrome.storage.local.set({ 'cachedArticles': articles }, () => {
                console.log('文章数据已缓存');
                sendResponse({ success: true, articles: articles });
            });
        })
        .catch(error => {
            console.error('获取文章失败:', error);
            sendResponse({ 
                success: false, 
                error: '获取文章失败',
                details: error.message 
            });
        });
        
        return true; // 保持消息通道开放
    }
}); 