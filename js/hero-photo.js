// Hero photo: switches to the taller profile-long.jpg (and lets the photo
// stretch to the text column's full height) at the exact moment the
// hero-links row wraps to a second line, rather than at a guessed viewport
// width — the wrap point depends on rendered button widths, not a fixed
// breakpoint.

(function () {
  const heroLayout = document.querySelector('.hero-layout');
  const heroLinks = document.getElementById('hero-links');
  const heroPhoto = document.getElementById('hero-photo');
  if (!heroLayout || !heroLinks || !heroPhoto) return;

  const SQUARE_SRC = 'assets/images/profile.jpg';
  const LONG_SRC = 'assets/images/profile-long.jpg';

  function updateWrapState() {
    const items = Array.from(heroLinks.children);
    if (items.length < 2) return;

    const wrapped = items[items.length - 1].offsetTop > items[0].offsetTop;
    heroLayout.classList.toggle('is-links-wrapped', wrapped);

    const nextSrc = wrapped ? LONG_SRC : SQUARE_SRC;
    if (!heroPhoto.src.endsWith(nextSrc)) heroPhoto.src = nextSrc;
  }

  if (window.ResizeObserver) {
    new ResizeObserver(updateWrapState).observe(heroLinks);
  } else {
    window.addEventListener('resize', updateWrapState);
  }
  updateWrapState();
})();
