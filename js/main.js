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

// Article pagination state
const articleState = {
    currentPage: 1,
    articlesPerPage: 10,
    currentTopic: null
};

// Article functions
async function showArticleTopic(topic) {
    const listContent = document.getElementById('article-list-content');
    const listContainer = document.getElementById('article-list');
    
    // Reset article pagination state
    articleState.currentPage = 1;
    articleState.currentTopic = topic;
    
    try {
        // Hide topics container and pagination
        document.getElementById('articles-topics').style.display = 'none';
        document.querySelector('.articles-container > .pagination').style.display = 'none';
        
        // Show article list container
        listContainer.style.display = 'block';
        
        // Display articles with pagination
        await displayArticlesPage();
        
    } catch (error) {
        console.error('Error loading articles:', error);
        listContent.innerHTML = '<div class="error-message">Error loading articles. Please try again.</div>';
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


function showArticleList() {
    document.getElementById('article-list').style.display = 'block';
    document.getElementById('article-content').style.display = 'none';
}

function showArtworksTopics() {
    document.getElementById('artworks-topics').style.display = 'grid';
    document.getElementById('artwork-grid').style.display = 'none';
}

// Topics data - Example with 16 topics (will show across 2 pages)
const articleTopics = [
    { id: 'ai', title: 'AI' },
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
    topicsPerPage: 12, // 3 rows × 4 topics
    topicsPerRow: 4    // Exactly 4 topics per row
};

// Calculate total pages
const totalPages = Math.ceil(articleTopics.length / state.topicsPerPage);

// Function to update pagination controls
function updatePagination() {
    const pageNumbers = document.getElementById('page-numbers');
    if (!pageNumbers) return; // Guard clause in case element doesn't exist
    
    pageNumbers.innerHTML = '';
    
    // Create page number buttons
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
    
    if (prevButton) {
        prevButton.disabled = state.currentPage === 1;
    }
    if (nextButton) {
        nextButton.disabled = state.currentPage === totalPages;
    }
}

// Function to display topics for current page
function displayTopics() {
    const container = document.getElementById('articles-topics');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Calculate start and end indices for current page
    const startIndex = (state.currentPage - 1) * state.topicsPerPage;
    const endIndex = Math.min(startIndex + state.topicsPerPage, articleTopics.length);
    
    // Get topics for current page
    const currentTopics = articleTopics.slice(startIndex, endIndex);
    
    // Create three rows with 4 topics each
    for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
        const startRowIndex = rowIndex * 4;
        const rowTopics = currentTopics.slice(startRowIndex, startRowIndex + 4);
        
        if (rowTopics.length > 0) {
            const row = document.createElement('div');
            row.className = 'articles-topic-row';
            
            // Create the 4 topic cards for this row
            rowTopics.forEach(topic => {
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

            // Fill empty slots in the row if needed
            const emptySlots = 4 - rowTopics.length;
            for (let i = 0; i < emptySlots; i++) {
                const emptyCard = document.createElement('div');
                emptyCard.className = 'articles-topic-card';
                emptyCard.style.visibility = 'hidden';
                row.appendChild(emptyCard);
            }

            container.appendChild(row);
        }
    }

    updatePagination();
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

async function displayArticlesPage() {
    const listContent = document.getElementById('article-list-content');
    const articles = await contentManager.loadArticleCategory(articleState.currentTopic);
    
    // Calculate pagination
    const startIndex = (articleState.currentPage - 1) * articleState.articlesPerPage;
    const endIndex = Math.min(startIndex + articleState.articlesPerPage, articles.length);
    const currentArticles = articles.slice(startIndex, endIndex);
    const totalPages = Math.ceil(articles.length / articleState.articlesPerPage);
    
    listContent.innerHTML = `
        <div class="articles-list">
            ${currentArticles.map(article => `
                <div class="article-card" onclick="showArticle('${articleState.currentTopic}', '${article.id}')">
                    <h3>${article.title}</h3>
                    <p>${article.excerpt}</p>
                    <small>${article.date}</small>
                    <div class="tags">
                        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        ${totalPages > 1 ? `
            <div class="pagination">
                <button class="pagination-button prev" 
                        onclick="changeArticlePage('prev')" 
                        ${articleState.currentPage === 1 ? 'disabled' : ''}>
                    Previous
                </button>
                <div class="page-numbers">
                    ${generatePageNumbers(articleState.currentPage, totalPages)}
                </div>
                <button class="pagination-button next" 
                        onclick="changeArticlePage('next')" 
                        ${articleState.currentPage === totalPages ? 'disabled' : ''}>
                    Next
                </button>
            </div>
        ` : ''}
    `;
}

function generatePageNumbers(currentPage, totalPages) {
    let pages = [];
    // Always show first page, last page, current page, and one page before and after current
    let toShow = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    
    // Remove invalid page numbers
    toShow = Array.from(toShow).filter(page => page >= 1 && page <= totalPages).sort((a, b) => a - b);
    
    // Generate page buttons with ellipsis where needed
    let result = '';
    toShow.forEach((page, index) => {
        // Add ellipsis if there's a gap
        if (index > 0 && page - toShow[index - 1] > 1) {
            result += '<span class="page-number" style="border:none;">...</span>';
        }
        
        result += `
            <button class="page-number ${page === currentPage ? 'active' : ''}"
                    onclick="goToArticlePage(${page})">
                ${page}
            </button>
        `;
    });
    
    return result;
}

async function changeArticlePage(direction) {
    const articles = await contentManager.loadArticleCategory(articleState.currentTopic);
    const totalPages = Math.ceil(articles.length / articleState.articlesPerPage);
    
    if (direction === 'prev' && articleState.currentPage > 1) {
        articleState.currentPage--;
        await displayArticlesPage();
    } else if (direction === 'next' && articleState.currentPage < totalPages) {
        articleState.currentPage++;
        await displayArticlesPage();
    }
}

async function goToArticlePage(page) {
    const articles = await contentManager.loadArticleCategory(articleState.currentTopic);
    const totalPages = Math.ceil(articles.length / articleState.articlesPerPage);
    
    if (page >= 1 && page <= totalPages) {
        articleState.currentPage = page;
        await displayArticlesPage();
    }
}

// Update showArticlesTopics to properly show/hide elements
function showArticlesTopics() {
    const topicsContainer = document.getElementById('articles-topics');
    const articleList = document.getElementById('article-list');
    const articleContent = document.getElementById('article-content');
    const topicsPagination = document.querySelector('.articles-container > .pagination');
    
    // Show topics and their pagination
    topicsContainer.style.display = 'block';
    topicsPagination.style.display = 'flex';
    
    // Hide article views
    articleList.style.display = 'none';
    articleContent.style.display = 'none';
    
    // Display topics
    displayTopics();
}

// Artwork topics data
const artworkTopics = [
    { id: 'paintings', title: 'Paintings', subtitle: 'Oil and acrylic works', image: 'images/topics/paintings.jpg' },
    { id: 'digital', title: 'Digital Art', subtitle: 'Digital creations', image: 'images/topics/digital.jpg' },
    { id: 'drawings', title: 'Drawings', subtitle: 'Pencil and charcoal', image: 'images/topics/drawings.jpg' },
    { id: 'sculptures', title: 'Sculptures', subtitle: '3D artworks', image: 'images/topics/sculptures.jpg' },
    { id: 'photography', title: 'Photography', subtitle: 'Digital and film', image: 'images/topics/photography.jpg' },
    { id: 'prints', title: 'Prints', subtitle: 'Various printing techniques', image: 'images/topics/prints.jpg' },
    { id: 'mixed-media', title: 'Mixed Media', subtitle: 'Combined techniques', image: 'images/topics/mixed-media.jpg' },
    { id: 'installations', title: 'Installations', subtitle: 'Space and context', image: 'images/topics/installations.jpg' },
    { id: 'ceramics', title: 'Ceramics', subtitle: 'Clay and pottery', image: 'images/topics/ceramics.jpg' },
    { id: 'textile', title: 'Textile Art', subtitle: 'Fabric and fiber', image: 'images/topics/textile.jpg' }
];

// Carousel state
let currentIndex = 0;

//Initialize carousel
function initializeCarousel() {
    const track = document.querySelector('.carousel-track');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    if (!track || !dotsContainer) return;

    // Clear existing content
    track.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    // Calculate center position for the first item
    const centerX = '50%';
    
    // Add topics to carousel
    artworkTopics.forEach((topic, index) => {
        const item = document.createElement('div');
        item.className = `carousel-item ${index === currentIndex ? 'active' : 
                         index === currentIndex - 1 ? 'prev' :
                         index === currentIndex + 1 ? 'next' : ''}`;
        item.style.left = centerX;
        
        item.innerHTML = `
            <div class="carousel-topic-card" onclick="showArtworkTopic('${topic.id}')">
                <img src="${topic.image}" alt="${topic.title}">
                <div class="overlay">
                    <h3>${topic.title}</h3>
                    <p>${topic.subtitle}</p>
                </div>
            </div>
        `;
        
        track.appendChild(item);
        
        // Add dot
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${index === currentIndex ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.onclick = () => goToSlide(index);
        dotsContainer.appendChild(dot);
    });

    updateCarouselPositions();
}

// Update carousel positions
function updateCarouselPositions() {
    const items = document.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.carousel-dot');
    
    items.forEach((item, index) => {
        // Reset all classes first
        item.className = 'carousel-item';
        
        // Add appropriate class based on position relative to current index
        if (index === currentIndex) {
            item.classList.add('active');
        } else if (index === currentIndex - 1) {
            item.classList.add('prev');
        } else if (index === currentIndex + 1) {
            item.classList.add('next');
        }
    });
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
}

// Move carousel
function moveCarousel(direction) {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < artworkTopics.length) {
        currentIndex = newIndex;
        updateCarouselPositions();
    }
}

// Go to specific slide
function goToSlide(index) {
    if (index >= 0 && index < artworkTopics.length) {
        currentIndex = index;
        updateCarouselPositions();
    }
}

// Show artworks topics function
function showArtworksTopics() {
    const artworksTopics = document.getElementById('artworks-topics');
    const artworkGrid = document.getElementById('artwork-grid');
    
    if (artworksTopics && artworkGrid) {
        // Reset current index when showing topics
        currentIndex = 0;
        
        // Show carousel container
        artworksTopics.style.display = 'block';
        artworkGrid.style.display = 'none';
        
        // Initialize or reinitialize carousel
        initializeCarousel();
    }
}