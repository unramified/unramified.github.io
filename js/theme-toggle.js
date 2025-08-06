const btn = document.querySelector('.toggle-btn');
const root = document.documentElement;
if (!btn) throw new Error('Theme toggle button not found');
const icon = btn.querySelector('i');

// Set ARIA
btn.setAttribute('role', 'switch');

// Theme toggle with improved accessibility and animations
btn.addEventListener('click', () => {
  const isDark = root.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';

  root.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  // Update icon
  icon.classList.remove('fa-sun', 'fa-moon');
  icon.classList.add(newTheme === 'dark' ? 'fa-moon' : 'fa-sun');

  // ARIA feedback
  btn.setAttribute('aria-pressed', newTheme === 'dark');

  // Animation feedback
  icon.classList.add('icon-transition');
  setTimeout(() => icon.classList.remove('icon-transition'), 300);
});

// On load: apply saved or preferred theme
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const useDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

  root.setAttribute('data-theme', useDark ? 'dark' : 'light');
  icon.classList.add(useDark ? 'fa-moon' : 'fa-sun');
  btn.setAttribute('aria-pressed', useDark);
});
