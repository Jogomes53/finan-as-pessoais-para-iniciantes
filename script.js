
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const menuBtn = document.getElementById('menu-btn');
    const themeBtn = document.getElementById('theme-btn');
    const links = document.querySelectorAll('.nav-list a');

    // Theme Logic
    let isDark = localStorage.getItem('theme') === 'dark';
    
    function applyTheme() {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeBtn.textContent = '☀️';
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeBtn.textContent = '🌙';
        }
    }
    
    // Initial Apply
    applyTheme();

    themeBtn.addEventListener('click', () => {
        isDark = !isDark;
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        applyTheme();
    });

    // Menu Logic
    function toggleMenu() {
        const isOpen = sidebar.classList.contains('open');
        if (isOpen) {
            sidebar.classList.remove('open');
            overlay.classList.remove('visible');
        } else {
            sidebar.classList.add('open');
            overlay.classList.add('visible');
        }
    }

    menuBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    links.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 1024) toggleMenu();
        });
    });

    // Reading Position Logic
    const savePosition = debounce(() => {
        localStorage.setItem('scrollPos', window.scrollY);
    }, 500);

    window.addEventListener('scroll', savePosition);

    const savedPos = localStorage.getItem('scrollPos');
    if (savedPos) {
        window.scrollTo(0, parseInt(savedPos));
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(() => console.log('PWA Service Worker Registered'))
            .catch(err => console.error('SW Registration Error:', err));
    }
});
