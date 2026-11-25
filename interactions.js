(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealGroups = [
    ['.about-copy', 'left'],
    ['.about-mission', 'left'],
    ['.dna-art', 'scale'],
    ['.expertise-services-copy', 'left'],
    ['.expertise-service-card', 'up'],
    ['#trials .section-head', 'up'],
    ['#trials .study', 'up'],
    ['.why-stack-intro', 'up'],
    ['.path', 'up'],
    ['.closing-cta-panel', 'scale'],
    ['.about-two-column > div', 'up'],
    ['.about-purpose-grid article', 'up'],
    ['.about-values-intro', 'scale'],
    ['.about-values-grid > article', 'up'],
    ['.about-ethics-media', 'left'],
    ['.about-ethics-content', 'right'],
    ['.about-ethics-list li', 'up'],
    ['.about-leadership-grid > div', 'up'],
    ['.about-connect-panel', 'scale'],
    ['.leadership-section-head', 'up'],
    ['.leader-photo', 'left'],
    ['.director-copy', 'right'],
    ['.investigator-card', 'up'],
    ['.leadership-partner-panel', 'scale'],
    ['.trials-hero-panel', 'scale'],
    ['.trials-section-head', 'up'],
    ['.trials-legend li', 'up'],
    ['.trial-card', 'up'],
    ['.participation-steps li', 'up'],
    ['.trials-cta-panel', 'scale'],
    ['.patients-hero-panel', 'scale'],
    ['.patient-topics', 'left'],
    ['.patient-answers article', 'up'],
    ['.patient-section-head', 'up'],
    ['.patient-faq-list details', 'up'],
    ['.patient-cta-panel', 'scale'],
    ['#contact .footer-grid > div', 'up']
  ];

  let revealIndex = 0;
  revealGroups.forEach(([selector, direction]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.dataset.reveal = direction;
      element.style.setProperty('--reveal-delay', `${Math.min(index * 80, 240)}ms`);
      revealIndex += 1;
    });
  });

  root.classList.add('motion-ready');
  requestAnimationFrame(() => root.classList.add('page-ready'));

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -7% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(element => revealObserver.observe(element));
  } else {
    document.querySelectorAll('[data-reveal]').forEach(element => element.classList.add('is-visible'));
  }

  const counters = document.querySelectorAll('.hero-stat dd, .about-page-stats dd');
  const animateCounter = element => {
    if (element.dataset.counted === 'true') return;
    const target = Number.parseInt(element.textContent, 10);
    if (!Number.isFinite(target) || reducedMotion.matches) return;
    element.dataset.counted = 'true';
    element.textContent = '0';
    const duration = 900;
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.55 });
    counters.forEach(counter => counterObserver.observe(counter));
  }

  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const targets = navLinks.map(link => {
    const id = link.getAttribute('href');
    return { link, section: id === '#top' ? document.querySelector('.hero') : document.querySelector(id) };
  }).filter(item => item.section);

  const setActiveLink = activeLink => {
    navLinks.forEach(link => {
      link.classList.toggle('active', link === activeLink);
      if (link === activeLink) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  if ('IntersectionObserver' in window) {
    const visibleSections = new Map();
    const spyObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => visibleSections.set(entry.target, entry.intersectionRatio));
      const visible = targets
        .filter(item => (visibleSections.get(item.section) || 0) > 0)
        .sort((a, b) => (visibleSections.get(b.section) || 0) - (visibleSections.get(a.section) || 0));
      if (visible[0]) setActiveLink(visible[0].link);
    }, { threshold: [0.08, 0.2, 0.4, 0.65], rootMargin: '-18% 0px -55% 0px' });
    targets.forEach(item => spyObserver.observe(item.section));
  }

  const investigatorZone = document.querySelector('.investigator-scroll-zone');
  const investigatorTrack = document.querySelector('.investigator-grid');
  let investigatorMaxShift = 0;
  let investigatorScheduled = false;

  const layoutInvestigatorScroll = () => {
    if (!investigatorZone || !investigatorTrack) return;
    if (window.innerWidth <= 700 || reducedMotion.matches) {
      investigatorZone.style.removeProperty('--investigator-scroll-height');
      investigatorTrack.style.removeProperty('--investigator-card-width');
      investigatorTrack.style.removeProperty('--investigator-edge-gutter');
      investigatorTrack.style.removeProperty('--investigator-shift');
      investigatorMaxShift = 0;
      return;
    }
    const gap = 24;
    const viewportWidth = document.documentElement.clientWidth;
    const edgeGutter = Math.max(20, (viewportWidth - investigatorZone.clientWidth) / 2);
    const tabletLayout = viewportWidth <= 1050;
    const cardWidth = tabletLayout
      ? Math.max(460, (viewportWidth - edgeGutter - gap) * 0.84)
      : Math.max(420, (viewportWidth - edgeGutter - gap * 2) / 2.25);
    investigatorTrack.style.setProperty('--investigator-edge-gutter', `${edgeGutter}px`);
    investigatorTrack.style.setProperty('--investigator-card-width', `${cardWidth}px`);
    investigatorMaxShift = Math.max(0, investigatorTrack.scrollWidth - viewportWidth);
    investigatorZone.style.setProperty('--investigator-scroll-height', `${investigatorMaxShift + window.innerHeight - 104}px`);
    updateInvestigatorScroll();
  };

  const updateInvestigatorScroll = () => {
    if (!investigatorZone || !investigatorTrack || window.innerWidth <= 700 || reducedMotion.matches) {
      investigatorScheduled = false;
      return;
    }
    const start = investigatorZone.getBoundingClientRect().top + window.scrollY - 104;
    const range = Math.max(1, investigatorZone.offsetHeight - window.innerHeight + 104);
    const progress = Math.min(Math.max((window.scrollY - start) / range, 0), 1);
    investigatorTrack.style.setProperty('--investigator-shift', `${-investigatorMaxShift * progress}px`);
    investigatorScheduled = false;
  };

  if (investigatorZone && investigatorTrack) {
    window.addEventListener('scroll', () => {
      if (investigatorScheduled) return;
      investigatorScheduled = true;
      requestAnimationFrame(updateInvestigatorScroll);
    }, { passive: true });
    window.addEventListener('resize', layoutInvestigatorScroll, { passive: true });
    window.addEventListener('load', layoutInvestigatorScroll, { once: true });
    layoutInvestigatorScroll();

    const investigatorCards = Array.from(investigatorTrack.querySelectorAll('.investigator-card'));
    const previousButton = document.querySelector('.investigator-prev');
    const nextButton = document.querySelector('.investigator-next');
    const dots = Array.from(document.querySelectorAll('.investigator-dots span'));
    const dotsGroup = document.querySelector('.investigator-dots');
    let mobileScrollScheduled = false;

    const currentMobileCard = () => investigatorCards.reduce((closest, card, index) => {
      const distance = Math.abs(card.offsetLeft - investigatorTrack.scrollLeft - 14);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: 0, distance: Infinity }).index;

    const updateMobileControls = () => {
      const activeIndex = currentMobileCard();
      dots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeIndex));
      if (dotsGroup) dotsGroup.setAttribute('aria-label', `Specialist ${activeIndex + 1} of ${investigatorCards.length}`);
      if (previousButton) previousButton.disabled = activeIndex === 0;
      if (nextButton) nextButton.disabled = activeIndex === investigatorCards.length - 1;
      mobileScrollScheduled = false;
    };

    const moveToMobileCard = direction => {
      const targetIndex = Math.min(Math.max(currentMobileCard() + direction, 0), investigatorCards.length - 1);
      investigatorTrack.scrollTo({
        left: Math.max(0, investigatorCards[targetIndex].offsetLeft - 14),
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
    };

    previousButton?.addEventListener('click', () => moveToMobileCard(-1));
    nextButton?.addEventListener('click', () => moveToMobileCard(1));
    investigatorTrack.addEventListener('scroll', () => {
      if (mobileScrollScheduled || window.innerWidth > 700) return;
      mobileScrollScheduled = true;
      requestAnimationFrame(updateMobileControls);
    }, { passive: true });
    window.addEventListener('resize', updateMobileControls, { passive: true });
    updateMobileControls();
  }

  const patientLearning = document.querySelector('.patient-learning');
  const patientArticles = Array.from(document.querySelectorAll('.patient-answers article[id]'));
  const patientTopicLinks = Array.from(document.querySelectorAll('.patient-topics a[href^="#"]'));
  const patientFaq = document.querySelector('#faq');
  const patientScrollTargets = patientFaq ? [...patientArticles, patientFaq] : patientArticles;

  if (patientLearning && patientArticles.length && patientTopicLinks.length) {
    const setReadingArticle = article => {
      patientArticles.forEach(item => item.classList.toggle('is-reading', item === article));
      patientTopicLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${article.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };

    patientLearning.classList.add('is-scrollspy-ready');
    setReadingArticle(patientArticles[0]);

    if ('IntersectionObserver' in window) {
      const visiblePatientArticles = new Map();
      const patientObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => visiblePatientArticles.set(entry.target, entry.intersectionRatio));
        const readingArticle = patientScrollTargets
          .filter(article => (visiblePatientArticles.get(article) || 0) > 0)
          .sort((a, b) => (visiblePatientArticles.get(b) || 0) - (visiblePatientArticles.get(a) || 0))[0];
        if (readingArticle) setReadingArticle(readingArticle);
      }, { threshold: [0.15, 0.35, 0.55, 0.75], rootMargin: '-22% 0px -35% 0px' });
      patientScrollTargets.forEach(article => patientObserver.observe(article));
    }

    patientTopicLinks.forEach(link => link.addEventListener('click', event => {
      const article = document.querySelector(link.getAttribute('href'));
      if (!article) return;
      event.preventDefault();
      setReadingArticle(article);
      article.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', link.getAttribute('href'));
    }));
  }
})();
