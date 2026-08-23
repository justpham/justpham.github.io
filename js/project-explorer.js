// Projects section: file-explorer tree wired to the card panel.
// Clicking a folder expands it and opens its README into the card in one
// action; clicking a file selects it directly. Only one folder is open
// (and one card visible) at a time, mirroring a single-selection file tree.

(function () {
  const explorer = document.querySelector('.project-explorer');
  if (!explorer) return;

  const folders = Array.from(explorer.querySelectorAll('.project-folder'));
  const fileLinks = Array.from(explorer.querySelectorAll('.file-link'));
  const cards = Array.from(explorer.querySelectorAll('.project-card'));

  function openFolder(folder) {
    folders.forEach((other) => {
      if (other === folder) return;
      other.classList.remove('is-open');
      const toggle = other.querySelector('.folder-toggle');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('i').classList.replace('fa-folder-open', 'fa-folder');
      other.querySelector('.folder-files').hidden = true;
    });

    folder.classList.add('is-open');
    const toggle = folder.querySelector('.folder-toggle');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.querySelector('i').classList.replace('fa-folder', 'fa-folder-open');
    folder.querySelector('.folder-files').hidden = false;
  }

  function selectProject(slug) {
    fileLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.project === slug);
    });
    cards.forEach((card) => {
      card.hidden = card.id !== `project-${slug}`;
    });
  }

  folders.forEach((folder) => {
    const toggle = folder.querySelector('.folder-toggle');
    const firstFile = folder.querySelector('.file-link');

    toggle.addEventListener('click', () => {
      openFolder(folder);
      if (firstFile) selectProject(firstFile.dataset.project);
    });
  });

  fileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      openFolder(link.closest('.project-folder'));
      selectProject(link.dataset.project);
    });
  });
})();
