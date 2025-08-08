// filename: toggle.js
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

    // Update all theme toggle buttons/icons on page
    document.querySelectorAll('.theme-toggle, .toggle-btn').forEach(btn => {
      btn.setAttribute('aria-pressed', theme === 'dark');
      // ensure an <i> exists for font-awesome toggling; create if absent
      let icon = btn.querySelector('i');
      if (!icon) {
        icon = document.createElement('i');
        icon.classList.add('theme-icon');
        // prefer prepend so text remains readable if button has label
        btn.prepend(icon);
      }
      // prefer fontawesome classes if available
      icon.classList.remove('fa-sun', 'fa-moon');
      icon.classList.add(theme === 'dark' ? 'fa-moon' : 'fa-sun');
      // small visual pulse
      icon.classList.add('icon-transition');
      window.setTimeout(() => icon.classList.remove('icon-transition'), 300);
    });
  }

  function toggleTheme() {
    const current = root.getAttribute('data-theme') || (prefersDark() ? 'dark' : 'light');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  /* ---------- Initialize theme on load ---------- */
  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(LS_KEY); } catch (e) { saved = null; }
    let themeToUse;
    if (isValidTheme(saved)) {
      themeToUse = saved;                     // highest precedence: user saved setting
    } else if (typeof prefersDark() === 'boolean') {
      themeToUse = prefersDark() ? 'dark' : 'light'; // system preference
    } else {
      themeToUse = 'dark';                   // default (you asked for dark-first)
    }
    applyTheme(themeToUse);
  }

  /* ---------- Wire up theme toggle buttons ---------- */
  function wireThemeButtons() {
    const btns = Array.from(document.querySelectorAll('.theme-toggle, .toggle-btn'));
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.setAttribute('role', 'switch');
      btn.setAttribute('aria-live', 'polite');

      // Make button keyboard-friendly
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

  /* ---------- Mobile drawer (hamburger) support ---------- */
  function wireMobileDrawer() {
    const toggles = Array.from(document.querySelectorAll('.mobile-toggle'));
    const drawer = document.querySelector('.mobile-drawer');

    if (!toggles.length || !drawer) return;

    // Ensure ARIA baseline
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('aria-modal', 'false'); // small non-blocking drawer

    const firstFocusable = () => {
      const els = drawer.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
      return els.length ? els[0] : drawer;
    };

    const openDrawer = (triggerBtn) => {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      toggles.forEach(b => b.setAttribute('aria-expanded', 'true'));
      // focus first focusable item for keyboard users
      window.setTimeout(() => firstFocusable().focus(), 120);
      // lock scrolling (simple)
      document.documentElement.style.overflow = 'hidden';
    };

    const closeDrawer = (triggerBtn) => {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      toggles.forEach(b => b.setAttribute('aria-expanded', 'false'));
      document.documentElement.style.overflow = '';
      if (triggerBtn && typeof triggerBtn.focus === 'function') triggerBtn.focus();
    };

    toggles.forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', (e) => {
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

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });

    // Close on click outside (but ignore clicks on toggles)
    document.addEventListener('click', (e) => {
      if (!drawer.classList.contains('open')) return;
      const clickedInside = drawer.contains(e.target);
      const clickedToggle = toggles.some(b => b.contains(e.target));
      if (!clickedInside && !clickedToggle) closeDrawer();
    });
  }

  /* ---------- Bootstrapping ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    wireThemeButtons();
    wireMobileDrawer();
  });

  // Expose small API for devtools if desired
  window.__siteTheme = {
    get: () => root.getAttribute('data-theme'),
    set: (t) => { if (isValidTheme(t)) applyTheme(t); },
    toggle: toggleTheme
  };
})();
