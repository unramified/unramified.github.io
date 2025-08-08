/* JS/toggle.js — robust theme + mobile toggle (debug-friendly) */
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
    // Reuse an existing <i> if present and looks like FA, else create one
    let icon = btn.querySelector('i');
    if (!icon) {
      icon = document.createElement('i');
      icon.classList.add('fa'); // FontAwesome base class (works with FA v5/6 compat)
      btn.prepend(icon);
    }
    // Remove both and add the one we want
    icon.classList.remove('fa-moon', 'fa-sun', 'fa-solid', 'fa-regular', 'fa-light');
    icon.classList.add(theme === 'dark' ? 'fa-moon' : 'fa-sun');
  }

  function applyTheme(theme) {
    if (!isValidTheme(theme)) {
      log('applyTheme: invalid theme', theme);
      return;
    }

    root.setAttribute('data-theme', theme);
    // also toggle body class for older/alternate CSS
    if (theme === 'dark') body.classList.add('dark-mode');
    else body.classList.remove('dark-mode');

    try { localStorage.setItem(LS_KEY, theme); } catch (e) { /* ignore */ }

    // Update all buttons we support
    const btns = document.querySelectorAll('.toggle-btn, .theme-toggle');
    btns.forEach(btn => {
      try {
        btn.setAttribute('aria-pressed', theme === 'dark');
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        ensureIconOn(btn, theme);
      } catch (e) {
        /* continue */
      }
    });

    log('Theme applied ->', theme);
  }

  function toggleTheme() {
    const current = root.getAttribute('data-theme') || (prefersDark() ? 'dark' : 'light');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(LS_KEY); } catch (e) { /* ignore */ }

    const themeToUse = isValidTheme(saved) ? saved : (prefersDark() ? 'dark' : 'light');
    applyTheme(themeToUse);
  }

  function wireThemeButtons() {
    const btns = Array.from(document.querySelectorAll('.toggle-btn, .theme-toggle'));
    if (!btns.length) {
      log('No theme toggle buttons found (looking for .toggle-btn or .theme-toggle).');
      return;
    }
    log('Wiring theme buttons (count):', btns.length);

    btns.forEach(btn => {
      // keyboard + click
      btn.setAttribute('role', 'switch');
      btn.setAttribute('aria-live', 'polite');

      // Prevent duplicate listeners if script re-loaded
      btn.__siteToggleWired = btn.__siteToggleWired || false;
      if (btn.__siteToggleWired) return;
      btn.__siteToggleWired = true;

      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        toggleTheme();
      });
      btn.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          toggleTheme();
        }
      });
    });
  }

  function wireMobileDrawer() {
    // support multiple button class variants
    const toggles = Array.from(document.querySelectorAll('.mobile-toggle, .mobile-menu-btn, .mobile-toggle-btn'));
    const drawer = document.querySelector('.mobile-drawer');

    if (!toggles.length || !drawer) {
      log('Mobile drawer wiring skipped — toggles:', toggles.length, 'drawerExists:', !!drawer);
      return;
    }

    log('Wiring mobile drawer — toggles:', toggles.length, 'drawer:', drawer);

    // Ensure ARIA baseline
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('aria-modal', 'false');

    const OPEN_CLASS = 'open';

    function openDrawer(trigger) {
      drawer.classList.add(OPEN_CLASS);
      drawer.setAttribute('aria-hidden', 'false');
      toggles.forEach(t => t.setAttribute('aria-expanded', 'true'));
      document.documentElement.style.overflow = 'hidden';
      // focus first focusable
      setTimeout(() => {
        const f = drawer.querySelector('a, button, input, [tabindex]:not([tabindex="-1"])');
        if (f) f.focus();
      }, 80);
      log('Mobile drawer opened');
    }
    function closeDrawer(trigger) {
      drawer.classList.remove(OPEN_CLASS);
      drawer.setAttribute('aria-hidden', 'true');
      toggles.forEach(t => t.setAttribute('aria-expanded', 'false'));
      document.documentElement.style.overflow = '';
      if (trigger && typeof trigger.focus === 'function') trigger.focus();
      log('Mobile drawer closed');
    }

    toggles.forEach(btn => {
      // avoid double-wiring
      if (btn.__siteDrawerWired) return;
      btn.__siteDrawerWired = true;

      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = drawer.classList.contains(OPEN_CLASS);
        isOpen ? closeDrawer(btn) : openDrawer(btn);
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains(OPEN_CLASS)) {
        closeDrawer();
      }
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!drawer.classList.contains(OPEN_CLASS)) return;
      const clickedInside = drawer.contains(e.target);
      const clickedToggle = toggles.some(b => b.contains(e.target));
      if (!clickedInside && !clickedToggle) closeDrawer();
    });
  }

  // Expose a mini API for debugging in console
  window.__siteTheme = {
    get: () => root.getAttribute('data-theme'),
    set: (t) => { if (isValidTheme(t)) applyTheme(t); },
    toggle: toggleTheme
  };

  // Boot
  document.addEventListener('DOMContentLoaded', () => {
    try {
      log('toggle.js loaded — initializing');
      initTheme();
      wireThemeButtons();
      wireMobileDrawer();
    } catch (err) {
      console.error('[site-toggle] init error', err);
    }
  });
})();
