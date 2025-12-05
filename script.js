
/**
 * BookToPWA Engine
 * A lightweight Single Page Application for reading eBooks
 */

const App = {
    // State
    data: null,
    config: null,
    state: {
        currentView: 'cover',
        chapterIndex: 0,
        theme: 'light',
        fontSize: 18,
        fontFamily: 'serif',
        lastRead: 0
    },

    // Elements
    el: {
        app: document.getElementById('app'),
        views: {
            cover: document.getElementById('view-cover'),
            reader: document.getElementById('view-reader'),
            toc: document.getElementById('view-toc')
        },
        content: document.getElementById('reader-content'),
        progressBar: document.getElementById('progress-bar'),
        chapterTitle: document.getElementById('chapter-display-title'),
        settingsModal: document.getElementById('settings-modal'),
        settingsOverlay: document.getElementById('settings-overlay'),
        btnPrev: document.getElementById('btn-prev'),
        btnNext: document.getElementById('btn-next'),
        tocList: document.getElementById('toc-list')
    },

    init() {
        // Load Data
        this.data = window.BOOK_DATA;
        this.config = window.APP_CONFIG;

        // Load Persisted State
        const saved = localStorage.getItem('pwa-book-state-' + this.config.appName);
        if (saved) {
            this.state = { ...this.state, ...JSON.parse(saved) };
        }

        // Apply Settings
        this.applyTheme();
        this.applyFont();

        // Hydrate UI
        this.renderCover();
        this.renderTOC();

        // Listeners
        this.setupListeners();

        // If user was reading, show "Resume" text
        if (this.state.chapterIndex > 0) {
            document.getElementById('btn-start-read').innerText = 'Continuar Leitura';
        }
    },

    saveState() {
        localStorage.setItem('pwa-book-state-' + this.config.appName, JSON.stringify(this.state));
    },

    navigateTo(viewName) {
        // Simple View Transition
        Object.values(this.el.views).forEach(el => {
            el.classList.remove('active', 'back-stack');
        });
        
        const target = this.el.views[viewName];
        if (target) {
            target.classList.add('active');
            this.state.currentView = viewName;
            this.saveState();
        }
    },

    renderCover() {
        document.getElementById('cover-title').innerText = this.data.title;
        document.getElementById('cover-author').innerText = this.data.author;
        // Generate a simple cover letter
        document.getElementById('cover-art-letter').innerText = this.data.title.charAt(0);
    },

    renderTOC() {
        this.el.tocList.innerHTML = '';
        this.data.chapters.forEach((chap, index) => {
            const li = document.createElement('li');
            li.className = 'toc-item ' + (index === this.state.chapterIndex ? 'active' : '');
            li.innerText = chap.title;
            li.onclick = () => {
                this.loadChapter(index);
                this.navigateTo('reader');
            };
            this.el.tocList.appendChild(li);
        });
    },

    loadChapter(index) {
        if (index < 0 || index >= this.data.chapters.length) return;

        this.state.chapterIndex = index;
        const chapter = this.data.chapters[index];

        // Reset scroll
        this.el.content.scrollTop = 0;

        // Render HTML
        const htmlContent = chapter.content
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => `<p>${line.trim()}</p>`)
            .join('');
            
        this.el.content.innerHTML = `
            <h2 class="chapter-title">${chapter.title}</h2>
            ${htmlContent}
            <div style="height: 50px"></div>
        `;

        // Update UI
        this.el.chapterTitle.innerText = chapter.title;
        
        // Update Buttons
        this.el.btnPrev.disabled = index === 0;
        this.el.btnNext.disabled = index === this.data.chapters.length - 1;
        this.el.btnNext.innerHTML = index === this.data.chapters.length - 1 ? 'Fim' : 'Próximo <span>&rarr;</span>';

        // Update Progress
        const percent = ((index + 1) / this.data.chapters.length) * 100;
        this.el.progressBar.style.width = percent + '%';

        this.saveState();
        this.renderTOC(); // Update active class
    },

    nextChapter() {
        this.loadChapter(this.state.chapterIndex + 1);
    },

    prevChapter() {
        this.loadChapter(this.state.chapterIndex - 1);
    },

    toggleSettings() {
        const isOpen = this.el.settingsModal.classList.contains('open');
        if (isOpen) {
            this.el.settingsModal.classList.remove('open');
            this.el.settingsOverlay.classList.remove('visible');
        } else {
            this.el.settingsModal.classList.add('open');
            this.el.settingsOverlay.classList.add('visible');
            // Update buttons state
            this.updateSettingsUI();
        }
    },

    updateSettingsUI() {
        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.val === this.state.theme);
        });
        // Font buttons
        document.querySelectorAll('.font-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.val === this.state.fontFamily);
        });
    },

    setTheme(theme) {
        this.state.theme = theme;
        this.applyTheme();
        this.saveState();
        this.updateSettingsUI();
    },

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.state.theme);
    },

    setFont(family) {
        this.state.fontFamily = family;
        this.applyFont();
        this.saveState();
        this.updateSettingsUI();
    },

    applyFont() {
        this.el.content.style.fontFamily = this.state.fontFamily === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)';
    },

    changeFontSize(delta) {
        let newSize = this.state.fontSize + delta;
        if (newSize < 14) newSize = 14;
        if (newSize > 32) newSize = 32;
        this.state.fontSize = newSize;
        this.el.content.style.fontSize = newSize + 'px';
        this.saveState();
    },

    setupListeners() {
        document.getElementById('btn-start-read').onclick = () => {
            this.loadChapter(this.state.chapterIndex);
            this.navigateTo('reader');
        };

        this.el.btnNext.onclick = () => this.nextChapter();
        this.el.btnPrev.onclick = () => this.prevChapter();
        
        document.getElementById('btn-menu').onclick = () => this.navigateTo('toc');
        document.getElementById('btn-back-toc').onclick = () => this.navigateTo('reader');
        
        document.getElementById('btn-settings').onclick = () => this.toggleSettings();
        this.el.settingsOverlay.onclick = () => this.toggleSettings();

        // Settings Listeners
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.onclick = () => this.setTheme(btn.dataset.val);
        });
        document.querySelectorAll('.font-btn').forEach(btn => {
            btn.onclick = () => this.setFont(btn.dataset.val);
        });
        document.getElementById('font-dec').onclick = () => this.changeFontSize(-2);
        document.getElementById('font-inc').onclick = () => this.changeFontSize(2);

        // Reader scroll listener (save position logic could go here)
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
