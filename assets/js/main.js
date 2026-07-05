(function () {
    'use strict';

    // Theme toggle: cycles light/dark, persisted in localStorage.
    // The default (no override) follows the system preference.
    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var root = document.documentElement;
            var current = root.getAttribute('data-theme');
            if (!current) {
                current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            var next = current === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try {
                localStorage.setItem('theme', next);
            } catch (e) { }
        });
    }

    // Mobile navigation
    var menuToggle = document.getElementById('menu-toggle');
    var header = document.getElementById('masthead');
    if (menuToggle && header) {
        menuToggle.addEventListener('click', function () {
            var open = header.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }
})();
