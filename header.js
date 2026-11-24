const header = document.querySelector('.site-header');
const toggle = document.querySelector('.mobile-toggle');
const nav = document.querySelector('.nav');
let keyboardNavigation = false;

document.addEventListener('pointerdown', event => {
  keyboardNavigation = false;
  header.classList.remove('is-keyboard-active');
  if (!header.contains(event.target) && nav.classList.contains('open')) setMenu(false);
}, { passive: true });
document.addEventListener('keydown', event => {
  if (event.key === 'Tab') {
    keyboardNavigation = true;
    header.classList.add('is-keyboard-active');
  }
});
header.addEventListener('focusin', () => {
  if (keyboardNavigation) header.classList.remove('is-hidden');
});

function setMenu(open) {
  nav.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  header.classList.remove('is-hidden');
}

toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    setMenu(false);
    toggle.focus();
  }
});

let previousY = Math.max(0, window.scrollY);
let direction = 0;
let distance = 0;
let scheduled = false;

function updateHeader() {
  const y = Math.max(0, window.scrollY);
  const delta = y - previousY;
  header.classList.toggle('is-scrolled', y > 24);
  const nextDirection = Math.sign(delta);
  if (nextDirection && nextDirection !== direction) distance = 0;
  if (nextDirection) direction = nextDirection;
  distance += Math.abs(delta);

  const keepVisible = y <= header.offsetHeight ||
    nav.classList.contains('open') ||
    (keyboardNavigation && header.contains(document.activeElement));
  if (keepVisible) {
    header.classList.remove('is-hidden');
  } else if (distance >= 10) {
    header.classList.toggle('is-hidden', direction > 0);
    distance = 0;
  }
  previousY = y;
  scheduled = false;
}

window.addEventListener('scroll', () => {
  if (!scheduled) {
    scheduled = true;
    window.requestAnimationFrame(updateHeader);
  }
}, { passive: true });
window.addEventListener('resize', () => {
  if (window.innerWidth > 1050 && nav.classList.contains('open')) setMenu(false);
  updateHeader();
});
updateHeader();
