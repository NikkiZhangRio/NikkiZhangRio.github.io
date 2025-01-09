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

// Loading state management
function showLoading(container) {
    // Remove any existing loading indicators first
    removeLoading(container);
    const loading = document.createElement('div');
    loading.className = 'loading';
    container.insertBefore(loading, container.firstChild);
}

function removeLoading(container) {
    const existingLoading = container.querySelector('.loading');
    if (existingLoading) {
        existingLoading.remove();
    }
}

// Article functions
async function showArticleTopic(topic) {
    const listContent = document.getElementById('article-list-content');
    const listContainer = document.getElementById('article-list');
    
    // Show loading state
    showLoading(listContent);
    
    try {
        const articles = await contentManager.loadArticleCategory(topic);
        
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
        listContainer.style.display = 'block';
    } catch (error) {
        console.error('Error loading articles:', error);
        listContent.innerHTML = '<div class="error-message">Error loading articles. Please try again.</div>';
    } finally {
        // Remove loading state
        removeLoading(listContent);
    }
}

async function showArticle(topic, articleId) {
    const contentContainer = document.getElementById('article-full-content');
    
    // Show loading state
    showLoading(contentContainer);
    
    try {
        const article = await contentManager.getArticle(topic, articleId);
        
        contentContainer.innerHTML = `
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
    } catch (error) {
        console.error('Error loading article:', error);
        contentContainer.innerHTML = '<div class="error-message">Error loading article. Please try again.</div>';
    } finally {
        // Remove loading state
        removeLoading(contentContainer);
    }
}

// Artwork functions
async function showArtworkTopic(topic) {
    const gridContent = document.getElementById('artwork-grid-content');
    const gridContainer = document.getElementById('artwork-grid');
    
    // Show loading state
    showLoading(gridContent);
    
    try {
        const artworks = await contentManager.loadArtworkCategory(topic);
        
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
        gridContainer.style.display = 'block';
    } catch (error) {
        console.error('Error loading artworks:', error);
        gridContent.innerHTML = '<div class="error-message">Error loading artworks. Please try again.</div>';
    } finally {
        // Remove loading state
        removeLoading(gridContent);
    }
}

// Navigation helper functions
function showArticlesTopics() {
    document.getElementById('articles-topics').style.display = 'grid';
    document.getElementById('article-list').style.display = 'none';
    document.getElementById('article-content').style.display = 'none';
}

function showArticleList() {
    document.getElementById('article-list').style.display = 'block';
    document.getElementById('article-content').style.display = 'none';
}

function showArtworksTopics() {
    document.getElementById('artworks-topics').style.display = 'grid';
    document.getElementById('artwork-grid').style.display = 'none';
}