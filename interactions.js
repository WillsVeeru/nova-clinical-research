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
    ['.privacy-hero-panel', 'scale'],
    ['.privacy-index', 'left'],
    ['.privacy-document-head', 'up'],
    ['.privacy-articles article', 'up'],
    ['.privacy-disclaimer', 'up'],
    ['.sponsors-hero-panel', 'scale'],
    ['.sponsors-section-head', 'up'],
    ['.sponsors-why-copy', 'right'],
    ['.therapeutic-grid article', 'up'],
    ['.therapeutic-alt-visual', 'left'],
    ['.therapeutic-alt-item', 'right'],
    ['.capability-grid article', 'up'],
    ['.recruitment-copy', 'left'],
    ['.demographics', 'right'],
    ['.feasibility-steps li', 'up'],
    ['.feasibility-timeline li', 'up'],
    ['.sponsors-cta-panel', 'scale'],
    ['.contact-hero-panel', 'scale'],
    ['.contact-type', 'up'],
    ['.contact-office', 'left'],
    ['.contact-forms', 'right'],
    ['.contact-page footer .footer-grid > div', 'up'],
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

  const feasibilityTimeline = document.querySelector('.feasibility-timeline');
  if (feasibilityTimeline) {
    const steps = Array.from(feasibilityTimeline.children);
    let progressFrame = null;
    const updateFeasibilityProgress = () => {
      progressFrame = null;
      const readingLine = window.innerHeight * 0.62;
      steps.forEach(step => {
        const number = step.querySelector('.feasibility-timeline-number');
        if (!number) return;
        const bounds = number.getBoundingClientRect();
        step.classList.toggle('is-complete', bounds.top + bounds.height / 2 <= readingLine);
      });
    };
    const queueFeasibilityProgress = () => {
      if (progressFrame === null) progressFrame = requestAnimationFrame(updateFeasibilityProgress);
    };
    window.addEventListener('scroll', queueFeasibilityProgress, { passive: true });
    window.addEventListener('resize', queueFeasibilityProgress, { passive: true });
    window.addEventListener('load', queueFeasibilityProgress, { once: true });
    updateFeasibilityProgress();
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
  const investigatorSticky = document.querySelector('.investigator-sticky');
  let investigatorMaxShift = 0;
  let investigatorScheduled = false;

  const layoutInvestigatorScroll = () => {
    if (!investigatorZone || !investigatorTrack) return;
    if (window.innerWidth <= 700 || reducedMotion.matches) {
      investigatorZone.style.removeProperty('--investigator-scroll-height');
      investigatorZone.style.removeProperty('--investigator-pin-top');
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
    const stickyHeight = investigatorSticky.offsetHeight;
    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 90;
    const pinTop = headerHeight + 16;
    investigatorZone.style.setProperty('--investigator-pin-top', `${pinTop}px`);
    investigatorZone.style.setProperty('--investigator-scroll-height', `${investigatorMaxShift + stickyHeight}px`);
    updateInvestigatorScroll();
  };

  const updateInvestigatorScroll = () => {
    if (!investigatorZone || !investigatorTrack || window.innerWidth <= 700 || reducedMotion.matches) {
      investigatorScheduled = false;
      return;
    }
    const pinTop = parseFloat(getComputedStyle(investigatorSticky).top) || 104;
    const start = investigatorZone.getBoundingClientRect().top + window.scrollY - pinTop;
    const range = Math.max(1, investigatorZone.offsetHeight - investigatorSticky.offsetHeight);
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
  const patientTopics = document.querySelector('.patient-topics');
  const patientTopicsToggle = document.querySelector('.patient-topics-toggle');

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
        const readingLine = window.innerWidth <= 700 ? 124 : 132;
        const readingArticle = patientScrollTargets
          .filter(article => (visiblePatientArticles.get(article) || 0) > 0)
          .sort((a, b) => {
            const aDistance = Math.abs(a.getBoundingClientRect().top - readingLine);
            const bDistance = Math.abs(b.getBoundingClientRect().top - readingLine);
            return aDistance - bDistance;
          })[0];
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
      if (window.innerWidth <= 700 && patientTopics && patientTopicsToggle) {
        patientTopics.classList.remove('is-open');
        patientTopicsToggle.setAttribute('aria-expanded', 'false');
      }
    }));

    patientTopicsToggle?.addEventListener('click', () => {
      const open = patientTopics.classList.toggle('is-open');
      patientTopicsToggle.setAttribute('aria-expanded', String(open));
    });
  }

  const therapeuticTabs = Array.from(document.querySelectorAll('[data-therapeutic-tab]'));
  const therapeuticVisual = document.querySelector('.therapeutic-alt-visual');
  const therapeuticScroll = document.querySelector('.therapeutic-alt-scroll');
  const therapeuticLayout = document.querySelector('.therapeutic-alt-layout');
  const therapeuticNumber = document.querySelector('[data-therapeutic-number]');
  const therapeuticTitle = document.querySelector('[data-therapeutic-title]');
  let therapeuticFrame;
  let activeTherapeuticIndex = 0;

  if (therapeuticTabs.length && therapeuticVisual && therapeuticScroll && therapeuticLayout && therapeuticNumber && therapeuticTitle) {
    const selectTherapeuticArea = index => {
      const tab = therapeuticTabs[index];
      if (!tab || index === activeTherapeuticIndex) return;
      activeTherapeuticIndex = index;
      therapeuticTabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      therapeuticNumber.textContent = tab.dataset.number;
      therapeuticTitle.textContent = tab.dataset.title;
    };

    const therapeuticMetrics = () => {
      const stickyTop = document.querySelector('.site-header')?.getBoundingClientRect().height || 90;
      therapeuticScroll.style.setProperty('--therapeutic-header-height', `${stickyTop}px`);
      const start = therapeuticScroll.getBoundingClientRect().top + window.scrollY - stickyTop;
      // Keep the scroll range stable while the panel animates to viewport height.
      const range = Math.max(1, therapeuticScroll.offsetHeight - (window.innerHeight - stickyTop));
      return { start, range };
    };

    const updateTherapeuticScroll = () => {
      therapeuticFrame = null;
      if (window.innerWidth <= 1050 || reducedMotion.matches) return;
      const { start, range } = therapeuticMetrics();
      therapeuticLayout.classList.toggle('is-expanded', window.scrollY >= start);
      const progress = Math.min(1, Math.max(0, (window.scrollY - start) / range));
      therapeuticLayout.style.setProperty('--therapeutic-progress', progress.toFixed(4));
      selectTherapeuticArea(Math.round(progress * (therapeuticTabs.length - 1)));
    };

    const queueTherapeuticScroll = () => {
      if (!therapeuticFrame) therapeuticFrame = requestAnimationFrame(updateTherapeuticScroll);
    };

    therapeuticTabs.forEach((tab, index) => tab.addEventListener('click', () => {
      if (window.innerWidth <= 1050 || reducedMotion.matches) {
        selectTherapeuticArea(index);
        return;
      }
      const { start, range } = therapeuticMetrics();
      window.scrollTo({
        top: start + (index / (therapeuticTabs.length - 1)) * range,
        behavior: 'smooth'
      });
    }));

    window.addEventListener('scroll', queueTherapeuticScroll, { passive: true });
    window.addEventListener('resize', queueTherapeuticScroll);
    updateTherapeuticScroll();
  }
})();
