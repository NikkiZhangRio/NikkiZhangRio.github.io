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
            showArticlesTopics();
        }
        if (pageId === 'artworks') {
            showArtworksTopics();
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

// Global navigation function used by the HTML buttons
window.showPage = function(pageId) {
    navigationManager.showPage(pageId);
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