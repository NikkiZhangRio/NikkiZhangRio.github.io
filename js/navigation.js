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
        console.log('Showing page:', pageId); // Debug log
        
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
            console.log('Page displayed:', pageId); // Debug log
        } else {
            console.error('Page not found:', pageId); // Debug log
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

    goBack() {
        if (this.previousPage) {
            this.showPage(this.previousPage);
        }
    }
}

// Initialize navigation manager
const navigationManager = new NavigationManager();

// Expose all necessary functions to the global scope (window object)
window.showPage = function(pageId) {
    navigationManager.showPage(pageId);
};

window.showArticlesTopics = function() {
    document.getElementById('articles-topics').style.display = 'flex';
    document.getElementById('article-list').style.display = 'none';
    document.getElementById('article-content').style.display = 'none';
};

window.showArticleList = function() {
    document.getElementById('article-list').style.display = 'block';
    document.getElementById('article-content').style.display = 'none';
};

window.showArtworksTopics = function() {
    document.getElementById('artworks-topics').style.display = 'grid';
    document.getElementById('artwork-grid').style.display = 'none';
};

window.showArticleTopic = async function(topic) {
    const contentManager = new ContentManager();
    const listContent = document.getElementById('article-list-content');
    const listContainer = document.getElementById('article-list');
    
    try {
        const articles = await contentManager.loadArticleCategory(topic);
        
        listContent.innerHTML = articles.map(article => `
            <div class="article-card" onclick="showArticle('${topic}', '${article.id}')">
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
                <small>${article.date}</small>
            </div>
        `).join('');

        document.getElementById('articles-topics').style.display = 'none';
        listContainer.style.display = 'block';
    } catch (error) {
        console.error('Error loading articles:', error);
        listContent.innerHTML = '<div class="error-message">Error loading articles. Please try again.</div>';
    }
};

window.showArtworkTopic = async function(topic) {
    const contentManager = new ContentManager();
    const gridContent = document.getElementById('artwork-grid-content');
    const gridContainer = document.getElementById('artwork-grid');
    
    try {
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
            navigationManager.goBack();
        });
    });

    // Check for hash in URL on initial load
    const hash = window.location.hash.slice(1);
    if (hash) {
        navigationManager.showPage(hash);
    }
});