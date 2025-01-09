// Content Manager
class ContentManager {
    constructor() {
        this.articlesCache = new Map();
        this.artworksCache = new Map();
    }

    async loadArticleCategory(category) {
        if (this.articlesCache.has(category)) {
            return this.articlesCache.get(category);
        }

        try {
            const response = await fetch(`data/articles/${category}.json`);
            const data = await response.json();
            this.articlesCache.set(category, data.articles);
            return data.articles;
        } catch (error) {
            console.error(`Error loading ${category} articles:`, error);
            return [];
        }
    }

    async loadArtworkCategory(category) {
        if (this.artworksCache.has(category)) {
            return this.artworksCache.get(category);
        }

        try {
            const response = await fetch(`data/artworks/${category}.json`);
            const data = await response.json();
            this.artworksCache.set(category, data.artworks);
            return data.artworks;
        } catch (error) {
            console.error(`Error loading ${category} artworks:`, error);
            return [];
        }
    }

    async getArticle(category, articleId) {
        const articles = await this.loadArticleCategory(category);
        return articles.find(article => article.id === articleId);
    }

    async getArtwork(category, artworkId) {
        const artworks = await this.loadArtworkCategory(category);
        return artworks.find(artwork => artwork.id === artworkId);
    }
}

// Initialize content manager
const contentManager = new ContentManager();

// Article functions
async function showArticleTopic(topic) {
    const articles = await contentManager.loadArticleCategory(topic);
    const listContent = document.getElementById('article-list-content');
    
    listContent.innerHTML = articles.map(article => `
        <div class="article-card" onclick="showArticle('${topic}', '${article.id}')">
            <h3>${article.title}</h3>
            <p>${article.excerpt}</p>
            <small>${article.date}</small>
            <div class="tags">
                ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');

    document.getElementById('articles-topics').style.display = 'none';
    document.getElementById('article-list').style.display = 'block';
}

async function showArticle(topic, articleId) {
    const article = await contentManager.getArticle(topic, articleId);
    
    document.getElementById('article-full-content').innerHTML = `
        <div class="article-card">
            <h2>${article.title}</h2>
            <small>${article.date}</small>
            <img src="${article.image}" alt="${article.title}" class="article-image">
            <p>${article.content}</p>
            <div class="tags">
                ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;

    document.getElementById('article-list').style.display = 'none';
    document.getElementById('article-content').style.display = 'block';
}

// Artwork functions
async function showArtworkTopic(topic) {
    const artworks = await contentManager.loadArtworkCategory(topic);
    const gridContent = document.getElementById('artwork-grid-content');
    
    gridContent.innerHTML = artworks.map(artwork => `
        <div class="artwork-card">
            <img src="${artwork.image}" alt="${artwork.title}">
            <h3>${artwork.title}</h3>
            <p>${artwork.medium}</p>
            <p>${artwork.dimensions}</p>
            <small>${artwork.year}</small>
            <p class="artwork-description">${artwork.description}</p>
            <div class="tags">
                ${artwork.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');

    document.getElementById('artworks-topics').style.display = 'none';
    document.getElementById('artwork-grid').style.display = 'block';
}