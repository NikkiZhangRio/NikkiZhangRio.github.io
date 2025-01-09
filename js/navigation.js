// Navigation state management
class NavigationManager {
    constructor() {
        this.currentPage = 'home';
        this.previousPage = null;
        this.initNavigation();
    }

    initNavigation() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                this.showPage(event.state.page, false);
            }
        });

        // Handle scroll-based navigation hiding
        let lastScroll = window.scrollY;
        const nav = document.querySelector('nav');

        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            if (currentScroll > lastScroll && currentScroll > 50) {
                nav.classList.add('nav-hidden');
            } else {
                nav.classList.remove('nav-hidden');
            }
            lastScroll = currentScroll;
        });
    }

    showPage(pageId, updateHistory = true) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });

        // Show the selected page
        const newPage = document.getElementById(pageId);
        if (newPage) {
            newPage.style.display = pageId === 'home' ? 'flex' : 'block';
            newPage.classList.add('active');
        }

        // Update navigation history
        if (updateHistory) {
            window.history.pushState({ page: pageId }, '', `#${pageId}`);
        }

        // Update page title
        this.updatePageTitle(pageId);

        // Update current page reference
        this.previousPage = this.currentPage;
        this.currentPage = pageId;

        // Scroll to top
        window.scrollTo(0, 0);

        // Reset content views if needed
        if (pageId === 'articles') {
            window.showArticlesTopics();
        }
        if (pageId === 'artworks') {
            window.showArtworksTopics();
        }
    }

    updatePageTitle(pageId) {
        const titles = {
            home: 'Your Name - Art & Words',
            about: 'Portfolio - About',
            articles: 'Portfolio - Articles',
            artworks: 'Portfolio - Artworks',
            contact: 'Portfolio - Contact'
        };
        document.title = titles[pageId] || 'Portfolio';
    }
}

// Initialize navigation manager
const navigationManager = new NavigationManager();

// Function to show articles topics view
function showArticlesTopics() {
    // Show topics and hide other views
    const topicsContainer = document.getElementById('articles-topics');
    const articleList = document.getElementById('article-list');
    const articleContent = document.getElementById('article-content');
    const topicsPagination = document.querySelector('.articles-container > .pagination');
    
    if (topicsContainer && articleList && articleContent) {
        // Show topics and their pagination
        topicsContainer.style.display = 'block';
        topicsPagination.style.display = 'flex';
        
        // Hide article views
        articleList.style.display = 'none';
        articleContent.style.display = 'none';
        
        // Display topics
        displayTopics();
    }
}

// Function to show article list view
function showArticleList() {
    const topicsContainer = document.getElementById('articles-topics');
    const articleList = document.getElementById('article-list');
    const articleContent = document.getElementById('article-content');
    const topicsPagination = document.querySelector('.articles-container > .pagination');

    // Hide topics and their pagination
    topicsContainer.style.display = 'none';
    topicsPagination.style.display = 'none';

    // Show article list and hide article content
    articleList.style.display = 'block';
    articleContent.style.display = 'none';

    // Redisplay articles with pagination
    displayArticlesPage();
}

// Function to show artworks topics view
function showArtworksTopics() {
    const artworksTopics = document.getElementById('artworks-topics');
    const artworkGrid = document.getElementById('artwork-grid');
    
    if (artworksTopics && artworkGrid) {
        artworksTopics.style.display = 'grid';
        artworkGrid.style.display = 'none';
    }
}

// Expose necessary functions to window object
window.showPage = function(pageId) {
    navigationManager.showPage(pageId);
};

window.showArticlesTopics = showArticlesTopics;
window.showArticleList = showArticleList;
window.showArtworksTopics = showArtworksTopics;

// Handle article topic display
window.showArticleTopic = async function(topic) {
    const listContent = document.getElementById('article-list-content');
    const listContainer = document.getElementById('article-list');
    const topicsPagination = document.querySelector('.articles-container > .pagination');
    
    // Hide topics pagination
    if (topicsPagination) {
        topicsPagination.style.display = 'none';
    }
    
    // Reset article pagination state
    articleState.currentPage = 1;
    articleState.currentTopic = topic;
    
    try {
        await displayArticlesPage();
        document.getElementById('articles-topics').style.display = 'none';
        listContainer.style.display = 'block';
    } catch (error) {
        console.error('Error loading articles:', error);
        listContent.innerHTML = '<div class="error-message">Error loading articles. Please try again.</div>';
    }
};

// Handle artwork topic display
window.showArtworkTopic = async function(topic) {
    const gridContent = document.getElementById('artwork-grid-content');
    const gridContainer = document.getElementById('artwork-grid');
    
    try {
        const contentManager = new ContentManager();
        const artworks = await contentManager.loadArtworkCategory(topic);
        
        gridContent.innerHTML = artworks.map(artwork => `
            <div class="artwork-card">
                <img src="${artwork.image}" alt="${artwork.title}">
                <h3>${artwork.title}</h3>
                <p>${artwork.medium}</p>
                <small>${artwork.year}</small>
            </div>
        `).join('');

        document.getElementById('artworks-topics').style.display = 'none';
        gridContainer.style.display = 'block';
    } catch (error) {
        console.error('Error loading artworks:', error);
        gridContent.innerHTML = '<div class="error-message">Error loading artworks. Please try again.</div>';
    }
};

// Initialize back buttons
document.addEventListener('DOMContentLoaded', () => {
    // Handle back buttons
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const parentSection = button.closest('.page');
            
            if (parentSection.id === 'articles') {
                // Check if we're in article content view
                if (document.getElementById('article-content').style.display === 'block') {
                    showArticleList(); // Go back to articles list
                } else {
                    showArticlesTopics(); // Go back to topics
                }
            } else if (parentSection.id === 'artworks') {
                showArtworksTopics(); // Go back to artworks topics
            }
        });
    });

    // Check for hash in URL on initial load
    const hash = window.location.hash.slice(1);
    if (hash) {
        navigationManager.showPage(hash);
    }
});