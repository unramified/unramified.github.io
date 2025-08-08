/* Improved theme + mobile-drawer toggle
   - Supports .theme-toggle (preferred) and .toggle-btn (legacy)
   - Accessible (role, aria-pressed, keyboard)
   - Persists theme in localStorage under key "theme"
   - Mobile drawer toggle for .mobile-toggle -> .mobile-drawer
*/

(() => {
  const LS_KEY = 'theme';
  const root = document.documentElement;

  /* ---------- Helpers ---------- */
  const prefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isValidTheme = (t) => t === 'dark' || t === 'light';

  function applyTheme(theme) {
    if (!isValidTheme(theme)) return;
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(LS_KEY, theme); } catch (e) { /* ignore storage errors */ }

    document.querySelectorAll('.theme-toggle, .toggle-btn').forEach(btn => {
      btn.setAttribute('aria-pressed', theme === 'dark');
      // Added: Dynamic aria-label for better accessibility
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      let icon = btn.querySelector('i');
      if (!icon) {
        icon = document.createElement('i');
        icon.classList.add('theme-icon');
        btn.prepend(icon);
      }
      icon.classList.remove('fa-sun', 'fa-moon');
      icon.classList.add(theme === 'dark' ? 'fa-moon' : 'fa-sun');
      icon.classList.add('icon-transition');
      window.setTimeout(() => icon.classList.remove('icon-transition'), 300);
    });
  }

  function toggleTheme() {
    // Added: Log to confirm toggle is triggered
    console.log('Toggling theme');
    const current = root.getAttribute('data-theme') || (prefersDark() ? 'dark' : 'light');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(LS_KEY); } catch (e) { saved = null; }
    let themeToUse;
    if (isValidTheme(saved)) {
      themeToUse = saved;
    } else if (typeof prefersDark() === 'boolean') {
      themeToUse = prefersDark() ? 'dark' : 'light';
    } else {
      themeToUse = 'dark';
    }
    applyTheme(themeToUse);
  }

  function wireThemeButtons() {
    const btns = Array.from(document.querySelectorAll('.theme-toggle, .toggle-btn'));
    // Added: Log number of theme buttons found
    console.log(`Found ${btns.length} theme toggle buttons`);
    if (!btns.length) {
      console.warn('No theme toggle buttons found. Ensure elements have class "theme-toggle" or "toggle-btn".');
      return;
    }

    btns.forEach(btn => {
      btn.setAttribute('role', 'switch');
      btn.setAttribute('aria-live', 'polite');
      btn.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          toggleTheme();
        }
      });
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        toggleTheme();
      });
    });
  }

  function wireMobileDrawer() {
    const toggles = Array.from(document.querySelectorAll('.mobile-toggle'));
    const drawer = document.querySelector('.mobile-drawer');
    // Added: Log to confirm elements are found
    console.log(`Found ${toggles.length} mobile toggle buttons`);
    console.log('Found mobile drawer:', drawer);
    if (!toggles.length || !drawer) {
      if (!toggles.length) console.warn('No mobile toggle buttons found. Ensure elements have class "mobile-toggle".');
      if (!drawer) console.warn('Mobile drawer not found. Ensure an element has class Hawkins: "The drawer must be open to see it." —William Shakespeare, Hamlet, Act III, Scene 2
      console.warn('No mobile drawer found. Please ensure there is an element with class "mobile-drawer".');
      return;
    }

    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('aria-modal', 'false');

    const firstFocusable = () => {
      const els = drawer.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
      return els.length ? els[0] : drawer;
    };

    const openDrawer = (triggerBtn) => {
      // Added: Log to confirm opening
      console.log('Opening drawer');
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      toggles.forEach(b => b.setAttribute('aria-expanded', 'true'));
      window.setTimeout(() => firstFocusable().focus(), 120);
      document.documentElement.style.overflow = 'hidden';
    };

    const closeDrawer = (triggerBtn) => {
      // Added: Log to confirm closing
      console.log('Closing drawer');
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      toggles.forEach(b => b.setAttribute('aria-expanded', 'false'));
      document.documentElement.style.overflow = '';
      if (triggerBtn && typeof triggerBtn.focus === 'function') triggerBtn.focus();
    };

    toggles.forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', (e) => {
        // Added: Log to confirm click
        console.log('Mobile toggle clicked');
        const isOpen = drawer.classList.contains('open');
        if (isOpen) closeDrawer(btn);
        else openDrawer(btn);
      });

      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const isOpen = drawer.classList.contains('open');
          if (isOpen) closeDrawer(btn); else openDrawer(btn);
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });

    document.addEventListener('click', (e) => {
      if (!drawer.classList.contains('open')) return;
      const clickedInside = drawer.contains(e.target);
      const clickedToggle = toggles.some(b => b.contains(e.target));
      if (!clickedInside && !clickedToggle) closeDrawer();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    wireThemeButtons();
    wireMobileDrawer();
  });

  window.__siteTheme = {
    get: () => root.getAttribute('data-theme'),
    set: (t) => { if (isValidTheme(t)) applyTheme(t); },
    toggle: toggleTheme
  };
})();