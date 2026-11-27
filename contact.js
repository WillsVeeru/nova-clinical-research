(() => {
  const tabs = Array.from(document.querySelectorAll('[data-contact-type]'));
  const panels = Array.from(document.querySelectorAll('[data-contact-panel]'));
  if (!tabs.length || !panels.length) return;

  const validTypes = new Set(tabs.map(tab => tab.dataset.contactType));
  const queryType = new URLSearchParams(window.location.search).get('type');

  const selectType = (type, updateUrl = false) => {
    if (!validTypes.has(type)) return;
    tabs.forEach(tab => {
      const selected = tab.dataset.contactType === type;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => {
      const selected = panel.dataset.contactPanel === type;
      panel.hidden = !selected;
      panel.classList.toggle('is-active', selected);
    });
    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('type', type);
      history.replaceState({}, '', `${url.pathname}${url.search}#form`);
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectType(tab.dataset.contactType, true));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const next = tabs[(index + direction + tabs.length) % tabs.length];
      selectType(next.dataset.contactType, true);
      next.focus();
    });
  });

  selectType(validTypes.has(queryType) ? queryType : 'participant');
})();
