/* JS/toggle.js — minimalist, accessible theme + mobile drawer */
(() => {
  const LS_KEY = 'theme';
  const root = document.documentElement;
  const body = document.body;

  const log = (...args) => {
    try { console.log('[site]', ...args); } catch (_) {}
  };

  const prefersDark = () =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const isValidTheme = (t) => t === 'dark' || t === 'light';

  // Optional: only if you actually have icon fonts; otherwise CSS can style via [aria-pressed]
  function ensureIconOn(btn, theme) {
    if (!btn) return;
    const useIcon = btn.dataset.icon !== 'off'; // allow opt-out via data-icon="off"
    if (!useIcon) return;
    let icon = btn.querySelector('i');
    if (!icon) {
      icon = document.createElement('i');
      icon.setAttribute('aria-hidden', 'true');
      btn.prepend(icon);
    }
    icon.className = ''; // reset
    // If you load Font Awesome, these will work; otherwise no visual harm.
    icon.classList.add('fa', theme === 'dark' ? 'fa-moon' : 'fa-sun');
  }

  function reflectButtons(theme) {
    const pressed = theme === 'dark';
    document.querySelectorAll('.toggle-btn, .theme-toggle, #theme-toggle').forEach(btn => {
      btn.setAttribute('aria-pressed', String(pressed));
      btn.setAttribute('aria-label', pressed ? 'Switch to light mode' : 'Switch to dark mode');
      btn.dataset.state = pressed ? 'dark' : 'light'; // CSS hook
      ensureIconOn(btn, theme);
    });
  }

  function applyTheme(theme) {
    if (!isValidTheme(theme)) return;
    root.setAttribute('data-theme', theme);
    body.classList.toggle('dark-mode', theme === 'dark');
    try { localStorage.setItem(LS_KEY, theme); } catch (_) {}
    reflectButtons(theme);
    log('theme:', theme);
  }

  function resolveInitialTheme() {
    let saved = null;
    try { saved = localStorage.getItem(LS_KEY); } catch (_) {}
    return isValidTheme(saved) ? saved : (prefersDark() ? 'dark' : 'light');
  }

  function toggleTheme() {
    const current = root.getAttribute('data-theme') || resolveInitialTheme();
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function wireThemeButtons() {
    const btns = Array.from(document.querySelectorAll('.toggle-btn, .theme-toggle, #theme-toggle'));
    if (!btns.length) { log('no theme buttons'); return; }
    btns.forEach(btn => {
      if (btn.__wiredTheme) return;
      btn.__wiredTheme = true;
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', btn.tabIndex >= 0 ? String(btn.tabIndex) : '0');
      btn.addEventListener('click', e => { e.preventDefault(); toggleTheme(); });
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); }
      });
    });
  }

  // Mobile drawer
  function wireMobileDrawer() {
    const toggles = Array.from(document.querySelectorAll('.mobile-toggle, .mobile-menu-btn, .mobile-toggle-btn, #mobile-toggle'));
    const drawer = document.querySelector('.mobile-drawer');
    if (!toggles.length || !drawer) { log('no drawer'); return; }

    const OPEN = 'open';
    const focusable = () => Array.from(drawer.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled'));

    function lockScroll(lock) {
      document.documentElement.style.overflow = lock ? 'hidden' : '';
      document.body.style.touchAction = lock ? 'none' : '';
    }

    function openDrawer() {
      if (drawer.classList.contains(OPEN)) return;
      drawer.classList.add(OPEN);
      drawer.setAttribute('aria-hidden', 'false');
      toggles.forEach(t => t.setAttribute('aria-expanded', 'true'));
      lockScroll(true);
      // Focus first item for accessibility
      const f = focusable()[0];
      if (f) setTimeout(() => f.focus(), 0);
    }

    function closeDrawer() {
      if (!drawer.classList.contains(OPEN)) return;
      drawer.classList.remove(OPEN);
      drawer.setAttribute('aria-hidden', 'true');
      toggles.forEach(t => t.setAttribute('aria-expanded', 'false'));
      lockScroll(false);
      // Return focus to the first toggler
      if (toggles[0]) toggles[0].focus();
    }

    toggles.forEach(btn => {
      if (btn.__wiredDrawer) return;
      btn.__wiredDrawer = true;
      btn.setAttribute('aria-controls', 'mobile-drawer');
      btn.addEventListener('click', e => {
        e.preventDefault();
        drawer.classList.contains(OPEN) ? closeDrawer() : openDrawer();
      });
    });

    // Assign id if missing for aria-controls
    if (!drawer.id) drawer.id = 'mobile-drawer';

    // Close on Esc
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer.classList.contains(OPEN)) closeDrawer();
    });

    // Click-away close
    document.addEventListener('click', e => {
      if (!drawer.classList.contains(OPEN)) return;
      if (!drawer.contains(e.target) && !toggles.some(b => b.contains(e.target))) closeDrawer();
    });

    // Basic focus trap
    drawer.addEventListener('keydown', e => {
      if (e.key !== 'Tab' || !drawer.classList.contains(OPEN)) return;
      const els = focusable();
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  // Public API for dev tools
  window.__siteTheme = {
    get: () => root.getAttribute('data-theme'),
    set: t => { if (isValidTheme(t)) applyTheme(t); },
    toggle: toggleTheme,
    sync: () => reflectButtons(root.getAttribute('data-theme') || resolveInitialTheme())
  };

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(resolveInitialTheme());
    wireThemeButtons();
    wireMobileDrawer();
  });
})();
```__
