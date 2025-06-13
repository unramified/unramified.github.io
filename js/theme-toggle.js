// js/theme-toggle.js

const btn = document.querySelector('.toggle-btn');
const root = document.documentElement;

// Toggle handler: add/remove the attribute, update storage
btn.addEventListener('click', () => {
  if (root.getAttribute('data-theme') === 'dark') {
    // Switch to light: remove attribute (falls back to :root vars)
    root.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    // Switch to dark
    root.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
});

// On load: apply saved theme, or (optionally) OS preference
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme');

  if (saved === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else if (saved === 'light') {
    // Light explicitly—ensure attr is cleared
    root.removeAttribute('data-theme');
  } else {
    // No saved preference: respect OS setting
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.setAttribute('data-theme', 'dark');
    }
  }
});
