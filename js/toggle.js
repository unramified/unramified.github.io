/* JS/toggle.js — robust theme + mobile toggle (debug-friendly, patched) */
(() => {
  const LS_KEY = 'theme';
  const root = document.documentElement;
  const body = document.body;

  const log = (...args) => {
    try { console.log('[site-toggle]', ...args); } catch(e) {}
  };

  const prefersDark = () =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const isValidTheme = (t) => t === 'dark' || t === 'light';

  function ensureIconOn(btn, theme) {
    let icon = btn.querySelector('i');
    if (!icon) {
      icon = document.createElement('i');
      btn.prepend(icon);
    }
    icon.className = ''; // reset classes completely
    icon.classList.add('fa', theme === 'dark' ? 'fa-moon' : 'fa-sun');
  }

  function applyTheme(theme) {
    if (!isValidTheme(theme)) return;
    root.setAttribute('data-theme', theme);

    if (theme === 'dark') body.classList.add('dark-mode');
    else body.classList.remove('dark-mode');

    try { localStorage.setItem(LS_KEY, theme); } catch (e) {}

    document.querySelectorAll('.toggle-btn, .theme-toggle, #theme-toggle').forEach(btn => {
      btn.setAttribute('aria-pressed', theme === 'dark');
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      ensureIconOn(btn, theme);
    });

    log('Theme applied ->', theme);
  }

  function toggleTheme() {
    const current = root.getAttribute('data-theme') || (prefersDark() ? 'dark' : 'light');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(LS_KEY); } catch (e) {}
    const themeToUse = isValidTheme(saved) ? saved : (prefersDark() ? 'dark' : 'light');
    applyTheme(themeToUse);
  }

  function wireThemeButtons() {
    const btns = Array.from(document.querySelectorAll('.toggle-btn, .theme-toggle, #theme-toggle'));
    if (!btns.length) {
      log('No theme toggle buttons found.');
      return;
    }
    btns.forEach(btn => {
      if (btn.__siteToggleWired) return;
      btn.__siteToggleWired = true;
      btn.addEventListener('click', e => {
        e.preventDefault();
        toggleTheme();
      });
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      });
    });
  }

  function wireMobileDrawer() {
    const toggles = Array.from(document.querySelectorAll('.mobile-toggle, .mobile-menu-btn, .mobile-toggle-btn, #mobile-toggle'));
    const drawer = document.querySelector('.mobile-drawer, #mobile-drawer');

    if (!toggles.length || !drawer) {
      log('Mobile drawer wiring skipped.');
      return;
    }

    const OPEN_CLASS = 'open';
    function openDrawer() {
      drawer.classList.add(OPEN_CLASS);
      drawer.setAttribute('aria-hidden', 'false');
      toggles.forEach(t => t.setAttribute('aria-expanded', 'true'));
      document.documentElement.style.overflow = 'hidden';
    }
    function closeDrawer() {
      drawer.classList.remove(OPEN_CLASS);
      drawer.setAttribute('aria-hidden', 'true');
      toggles.forEach(t => t.setAttribute('aria-expanded', 'false'));
      document.documentElement.style.overflow = '';
    }

    toggles.forEach(btn => {
      if (btn.__siteDrawerWired) return;
      btn.__siteDrawerWired = true;
      btn.addEventListener('click', e => {
        e.preventDefault();
        drawer.classList.contains(OPEN_CLASS) ? closeDrawer() : openDrawer();
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer.classList.contains(OPEN_CLASS)) closeDrawer();
    });

    document.addEventListener('click', e => {
      if (!drawer.classList.contains(OPEN_CLASS)) return;
      if (!drawer.contains(e.target) && !toggles.some(b => b.contains(e.target))) closeDrawer();
    });
  }

  window.__siteTheme = {
    get: () => root.getAttribute('data-theme'),
    set: t => { if (isValidTheme(t)) applyTheme(t); },
    toggle: toggleTheme
  };

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    wireThemeButtons();
    wireMobileDrawer();
  });
})();
