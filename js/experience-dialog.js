// Experience & Education timeline: the four cards with a data-dialog-target
// (Intel, both AMD internships, Qumulo) become clickable cards that open a
// matching <dialog> (native <dialog> already handles Escape-to-close, focus
// trapping, and restoring focus to the trigger on close). Photos inside any
// open experience dialog are themselves buttons (.photo-trigger) that open
// a second, shared lightbox dialog on top of the first at full size.

(function () {
  const cards = document.querySelectorAll('.timeline-card[data-dialog-target]');

  cards.forEach((card) => {
    const dialog = document.getElementById(card.dataset.dialogTarget);
    if (!dialog) return;

    card.classList.add('is-clickable');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-haspopup', 'dialog');

    card.addEventListener('click', () => dialog.showModal());

    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      dialog.showModal();
    });

    const closeBtn = dialog.querySelector('.experience-dialog-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => dialog.close());
    }

    // A click that lands on the dialog element itself (rather than a
    // descendant) is a click on the ::backdrop, since the dialog's own box
    // is exactly its visible content area.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  const lightbox = document.getElementById('photo-lightbox');
  const lightboxImg = document.getElementById('photo-lightbox-img');

  if (lightbox && lightboxImg) {
    document.querySelectorAll('.photo-trigger').forEach((trigger) => {
      const img = trigger.querySelector('img');
      if (!img) return;

      trigger.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.showModal();
      });
    });

    const lightboxCloseBtn = lightbox.querySelector('.experience-dialog-close');
    if (lightboxCloseBtn) {
      lightboxCloseBtn.addEventListener('click', () => lightbox.close());
    }

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) lightbox.close();
    });
  }
})();
