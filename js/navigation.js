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
            this.showArticlesTopics();
        }
        if (pageId === 'artworks') {
            this.showArtworksTopics();
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

    // Article section navigation
    showArticlesTopics() {
        const articlesPage = document.getElementById('articles');
        const topicsContainer = articlesPage.querySelector('#articles-topics');
        const articleList = articlesPage.querySelector('#article-list');
        const articleContent = articlesPage.querySelector('#article-content');
        const topicsPagination = articlesPage.querySelector('.articles-container > .pagination');
        
        if (topicsContainer && articleList && articleContent) {
            // Show topics and their pagination
            topicsContainer.style.display = 'block';
            if (topicsPagination) topicsPagination.style.display = 'flex';
            
            // Hide article views
            articleList.style.display = 'none';
            articleContent.style.display = 'none';
            
            // Display topics
            displayTopics();
        }
    }

    // Artwork section navigation
    showArtworksTopics() {
        const artworksPage = document.getElementById('artworks');
        const topicsGrid = artworksPage.querySelector('#artworks-topics');
        const artworkGrid = artworksPage.querySelector('#artwork-grid');
        
        if (topicsGrid && artworkGrid) {
            topicsGrid.style.display = 'grid';
            artworkGrid.style.display = 'none';
        }
    }
}

// Initialize navigation manager
const navigationManager = new NavigationManager();

// Expose necessary functions to window object
window.showPage = (pageId) => navigationManager.showPage(pageId);
window.showArticlesTopics = () => navigationManager.showArticlesTopics();
window.showArtworksTopics = () => navigationManager.showArtworksTopics();

// Show article list function
window.showArticleList = () => {
    const articlesPage = document.getElementById('articles');
    const topicsContainer = articlesPage.querySelector('#articles-topics');
    const articleList = articlesPage.querySelector('#article-list');
    const articleContent = articlesPage.querySelector('#article-content');
    const topicsPagination = articlesPage.querySelector('.articles-container > .pagination');

    // Hide topics and their pagination
    if (topicsContainer) topicsContainer.style.display = 'none';
    if (topicsPagination) topicsPagination.style.display = 'none';

    // Show article list and hide article content
    if (articleList) articleList.style.display = 'block';
    if (articleContent) articleContent.style.display = 'none';

    // Redisplay articles with pagination
    displayArticlesPage();
};

// Handle article topic display
window.showArticleTopic = async (topic) => {
    const articlesPage = document.getElementById('articles');
    const listContent = articlesPage.querySelector('#article-list-content');
    const listContainer = articlesPage.querySelector('#article-list');
    const topicsPagination = articlesPage.querySelector('.articles-container > .pagination');
    
    // Reset article pagination state
    articleState.currentPage = 1;
    articleState.currentTopic = topic;
    
    try {
        // Hide topics container and pagination
        articlesPage.querySelector('#articles-topics').style.display = 'none';
        if (topicsPagination) topicsPagination.style.display = 'none';
        
        // Show article list container
        listContainer.style.display = 'block';
        
        // Display articles with pagination
        await displayArticlesPage();
    } catch (error) {
        console.error('Error loading articles:', error);
        listContent.innerHTML = '<div class="error-message">Error loading articles. Please try again.</div>';
    }
};

// Handle artwork topic display
window.showArtworkTopic = async (topic) => {
    const artworksPage = document.getElementById('artworks');
    const gridContent = artworksPage.querySelector('#artwork-grid-content');
    const gridContainer = artworksPage.querySelector('#artwork-grid');
    
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

        artworksPage.querySelector('#artworks-topics').style.display = 'none';
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
                    window.showArticleList(); // Go back to articles list
                } else {
                    window.showArticlesTopics(); // Go back to topics
                }
            } else if (parentSection.id === 'artworks') {
                window.showArtworksTopics(); // Go back to artworks topics
            }
        });
    });

    // Check for hash in URL on initial load
    const hash = window.location.hash.slice(1);
    if (hash) {
        navigationManager.showPage(hash);
    }
});