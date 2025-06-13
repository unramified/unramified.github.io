// js/theme-toggle.js
const btn = document.querySelector('.toggle-btn');
const root = document.documentElement;
const icon = btn.querySelector('i');

// Toggle handler: add/remove the attribute, update storage and icon
btn.addEventListener('click', () => {
  if (root.getAttribute('data-theme') === 'dark') {
    // Switch to light
    root.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  } else {
    // Switch to dark
    root.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  }
});

// On load: apply saved theme or OS preference, and set icon
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    root.setAttribute('data-theme', 'dark');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else if (saved === 'light') {
    root.removeAttribute('data-theme');
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  } else {
    // No saved preference: respect OS setting
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.setAttribute('data-theme', 'dark');
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  }
});
