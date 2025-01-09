// Navigation state management
class NavigationManager {
    constructor() {
        this.currentPage = 'home';
        this.previousPage = null;
        this.pageHistory = [];
        this.lastScrollPosition = 0;
        this.navHideThreshold = 50;
        
        // Initialize navigation
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
            if (currentScroll > lastScroll && currentScroll > this.navHideThreshold) {
                nav.classList.add('nav-hidden');
            } else {
                nav.classList.remove('nav-hidden');
            }
            lastScroll = currentScroll;
        });

        // Initialize loading indicators
        this.setupLoadingIndicators();
    }

    showPage(pageId, updateHistory = true) {
        const oldPage = document.querySelector('.page.active');
        const newPage = document.getElementById(pageId);
        
        if (!newPage) return;

        // Update navigation history
        if (updateHistory) {
            this.pageHistory.push(this.currentPage);
            window.history.pushState({ page: pageId }, '', `#${pageId}`);
        }

        // Update page visibility
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });

        // Show new page with transition
        newPage.style.display = pageId === 'home' ? 'flex' : 'block';
        setTimeout(() => {
            newPage.classList.add('active');
        }, 10);

        // Update page title
        this.updatePageTitle(pageId);

        // Update current page reference
        this.previousPage = this.currentPage;
        this.currentPage = pageId;

        // Scroll to top with smooth animation
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Reset any active content views
        this.resetContentViews(pageId);
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

    resetContentViews(pageId) {
        if (pageId === 'articles') {
            showArticlesTopics();
        }
        if (pageId === 'artworks') {
            showArtworksTopics();
        }
    }

    setupLoadingIndicators() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        
        // Add loading indicator before content loads
        document.querySelectorAll('.topic-grid, .article-list, .artwork-grid').forEach(container => {
            const loader = loadingDiv.cloneNode(true);
            container.parentNode.insertBefore(loader, container);
        });
    }

    goBack() {
        if (this.pageHistory.length > 0) {
            const previousPage = this.pageHistory.pop();
            this.showPage(previousPage, false);
            window.history.back();
        }
    }
}

// Handle back buttons
function initializeBackButtons() {
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            navigationManager.goBack();
        });
    });
}

// Initialize navigation manager
const navigationManager = new NavigationManager();

// Expose navigation function globally
function showPage(pageId) {
    navigationManager.showPage(pageId);
}

// Initialize back buttons when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeBackButtons);

// Handle initial page load based on URL hash
window.addEventListener('load', () => {
    const hash = window.location.hash.slice(1);
    if (hash) {
        showPage(hash);
    }
});