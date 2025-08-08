/* Fixed theme + mobile-drawer toggle */
(() => {
  const LS_KEY = 'theme';
  const root = document.documentElement;

  const prefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isValidTheme = (t) => t === 'dark' || t === 'light';

  function applyTheme(theme) {
    if (!isValidTheme(theme)) return;
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(LS_KEY, theme); } catch {}

    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.setAttribute('aria-pressed', theme === 'dark');
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      let icon = btn.querySelector('i') || document.createElement('i');
      icon.classList.remove('fa-sun', 'fa-moon');
      icon.classList.add(theme === 'dark' ? 'fa-moon' : 'fa-sun');
      if (!btn.contains(icon)) btn.prepend(icon);
    });
  }

  function toggleTheme() {
    const current = root.getAttribute('data-theme') || (prefersDark() ? 'dark' : 'light');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(LS_KEY); } catch {}
    applyTheme(isValidTheme(saved) ? saved : prefersDark() ? 'dark' : 'light');
  }

  function wireThemeButtons() {
    const btns = document.querySelectorAll('.toggle-btn');
    btns.forEach(btn => {
      btn.setAttribute('role', 'switch');
      btn.addEventListener('click', toggleTheme);
      btn.addEventListener('keydown', e => {
        if (['Enter', ' '].includes(e.key)) { e.preventDefault(); toggleTheme(); }
      });
    });
  }

  function wireMobileDrawer() {
    const toggles = document.querySelectorAll('.mobile-toggle');
    const drawer = document.querySelector('.mobile-drawer');
    if (!toggles.length || !drawer) return;

    const openDrawer = () => {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
    };

    toggles.forEach(btn => {
      btn.addEventListener('click', () => {
        drawer.classList.contains('open') ? closeDrawer() : openDrawer();
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });

    document.addEventListener('click', e => {
      if (drawer.classList.contains('open') && !drawer.contains(e.target) && ![...toggles].some(t => t.contains(e.target))) closeDrawer();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    wireThemeButtons();
    wireMobileDrawer();
  });
})();
