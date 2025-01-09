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

// Topics data
const articleTopics = [
    { id: 'nature', title: 'Nature' },
    { id: 'art', title: 'Art' },
    { id: 'technology', title: 'Technology' },
    { id: 'culture', title: 'Culture' },
    { id: 'science', title: 'Science' },
    { id: 'travel', title: 'Travel' },
    { id: 'food', title: 'Food & Cooking' },
    { id: 'health', title: 'Health & Wellness' },
    { id: 'books', title: 'Books & Literature' },
    { id: 'music', title: 'Music' },
    { id: 'film', title: 'Film & Cinema' },
    { id: 'photography', title: 'Photography' },
    { id: 'architecture', title: 'Architecture' },
    { id: 'design', title: 'Design' },
    { id: 'history', title: 'History' },
    { id: 'philosophy', title: 'Philosophy' }
];

// Pagination state
const state = {
    currentPage: 1,
    topicsPerPage: 12,
    topicsPerRow: 4
};

// Calculate total pages
const totalPages = Math.ceil(articleTopics.length / state.topicsPerPage);

// Function to create a row of topics
function createTopicRow(topics) {
    const row = document.createElement('div');
    row.className = 'articles-topic-row';
    
    topics.forEach(topic => {
        const card = document.createElement('div');
        card.className = 'articles-topic-card';
        card.onclick = () => showArticleTopic(topic.id);
        
        card.innerHTML = `
            <div class="articles-topic-content">
                <h3>${topic.title}</h3>
            </div>
        `;
        
        row.appendChild(card);
    });

    // Fill empty slots in the last row
    const emptySlots = state.topicsPerRow - topics.length;
    for (let i = 0; i < emptySlots; i++) {
        const emptyCard = document.createElement('div');
        emptyCard.className = 'articles-topic-card empty';
        emptyCard.style.visibility = 'hidden';
        row.appendChild(emptyCard);
    }

    return row;
}

// Function to display topics for current page
function displayTopics() {
    const container = document.getElementById('articles-topics');
    container.innerHTML = '';
    
    // Calculate start and end indices for current page
    const startIndex = (state.currentPage - 1) * state.topicsPerPage;
    const endIndex = Math.min(startIndex + state.topicsPerPage, articleTopics.length);
    
    // Get topics for current page
    const currentTopics = articleTopics.slice(startIndex, endIndex);
    
    // Create rows
    for (let i = 0; i < currentTopics.length; i += state.topicsPerRow) {
        const rowTopics = currentTopics.slice(i, i + state.topicsPerRow);
        const row = createTopicRow(rowTopics);
        container.appendChild(row);
    }

    updatePagination();
}

// Function to update pagination controls
function updatePagination() {
    const pageNumbers = document.getElementById('page-numbers');
    pageNumbers.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const pageNumber = document.createElement('button');
        pageNumber.className = `page-number ${i === state.currentPage ? 'active' : ''}`;
        pageNumber.textContent = i;
        pageNumber.onclick = () => goToPage(i);
        pageNumbers.appendChild(pageNumber);
    }

    // Update prev/next buttons
    const prevButton = document.querySelector('.pagination-button.prev');
    const nextButton = document.querySelector('.pagination-button.next');
    
    prevButton.disabled = state.currentPage === 1;
    nextButton.disabled = state.currentPage === totalPages;
}

// Function to change page
function changePage(direction) {
    if (direction === 'prev' && state.currentPage > 1) {
        state.currentPage--;
    } else if (direction === 'next' && state.currentPage < totalPages) {
        state.currentPage++;
    }
    displayTopics();
}

// Function to go to specific page
function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
        state.currentPage = page;
        displayTopics();
    }
}

// Initialize topics display
function initializeTopics() {
    displayTopics();
}

// Update showArticlesTopics function
function showArticlesTopics() {
    document.getElementById('articles-topics').style.display = 'flex';
    document.getElementById('article-list').style.display = 'none';
    document.getElementById('article-content').style.display = 'none';
    initializeTopics();
}