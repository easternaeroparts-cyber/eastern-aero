/* ============================================================
   Eastern Aero — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

/* --- Hero background slideshow --- */
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length > 1) {
    let current = 0;

    function activateSlide(index) {
      /* Deactivate current slide */
      const leaving = slides[current];
      leaving.classList.remove('active');
      const leavingVideo = leaving.querySelector('.hero-video');
      if (leavingVideo) {
        leavingVideo.pause();
        leavingVideo.currentTime = 0;
      }

      /* Activate next slide */
      current = index;
      const arriving = slides[current];
      arriving.classList.add('active');
      const arrivingVideo = arriving.querySelector('.hero-video');
      if (arrivingVideo) {
        arrivingVideo.playbackRate = 0.5;
        arrivingVideo.currentTime = 0;
        arrivingVideo.play().catch(() => {});
      }
    }

    setInterval(() => {
      activateSlide((current + 1) % slides.length);
    }, 5000);
  }

  /* --- Navbar scroll effect --- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* --- Mobile nav toggle --- */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileClose = document.getElementById('mobile-close');

  hamburger.addEventListener('click', () => mobileNav.classList.add('open'));
  mobileClose.addEventListener('click', () => mobileNav.classList.remove('open'));
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileNav.classList.remove('open'));
  });

  /* --- Smooth scroll for anchors --- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
  });

  /* --- Intersection Observer for fade-in animations --- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  /* --- Animated counters --- */
  function animateCounter(el, target, suffix = '') {
    let start = 0;
    const duration = 1800;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el, parseInt(el.dataset.target, 10), el.dataset.suffix || '');
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

  /* -------------------------------------------------------------------
     FLEET SLIDER
     ------------------------------------------------------------------- */
  const track      = document.getElementById('fleet-track');
  const prevBtn    = document.getElementById('fleet-prev');
  const nextBtn    = document.getElementById('fleet-next');
  const dotsWrap   = document.getElementById('fleet-dots');
  const viewport   = track?.parentElement;

  if (track && prevBtn && nextBtn) {
    const GAP = 20; // px — must match CSS gap (1.25rem ≈ 20px)
    let currentIndex = 0;
    let visibleCount = 4;
    let cardWidth = 260;

    /* How many cards fit at current viewport width */
    function getVisibleCount() {
      const vw = window.innerWidth;
      if (vw >= 1280) return 3;
      if (vw >= 768)  return 2;
      return 1;
    }

    const cards = Array.from(track.querySelectorAll('.fleet-card-img'));
    const total = cards.length;

    /* Set card width as CSS variable so CSS picks it up */
    function setCardWidth() {
      visibleCount = getVisibleCount();
      const availableWidth = viewport.offsetWidth - (GAP * (visibleCount - 1));
      cardWidth = Math.floor(availableWidth / visibleCount);

      cards.forEach(card => {
        card.style.setProperty('--card-w', cardWidth + 'px');
        card.style.flex = `0 0 ${cardWidth}px`;
        card.style.width = `${cardWidth}px`;
      });
    }

    /* Build dot buttons */
    function buildDots() {
      dotsWrap.innerHTML = '';
      const numDots = total - visibleCount + 1;
      for (let i = 0; i < numDots; i++) {
        const dot = document.createElement('button');
        dot.className = 'fleet-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }

    function updateDots() {
      Array.from(dotsWrap.children).forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function goTo(index) {
      const maxIndex = Math.max(0, total - visibleCount);

      /* Wrap around: past end → go to start, before start → go to end */
      if (index > maxIndex) index = 0;
      if (index < 0)        index = maxIndex;

      currentIndex = index;
      const offset = currentIndex * (cardWidth + GAP);

      track.style.transform = `translateX(-${offset}px)`;

      /* Arrows never disabled in loop mode */
      prevBtn.disabled = false;
      nextBtn.disabled = false;

      updateDots();
    }

    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    /* Touch / swipe support */
    let touchStartX = 0;
    let touchDeltaX = 0;

    viewport.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    viewport.addEventListener('touchmove', e => {
      touchDeltaX = e.touches[0].clientX - touchStartX;
    }, { passive: true });

    viewport.addEventListener('touchend', () => {
      if (touchDeltaX < -50) goTo(currentIndex + 1);
      if (touchDeltaX >  50) goTo(currentIndex - 1);
      touchDeltaX = 0;
    });

    /* Keyboard arrow support when slider is focused */
    viewport.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
      if (e.key === 'ArrowRight') goTo(currentIndex + 1);
    });

    /* Auto-play */
    const AUTO_DELAY = 3500;
    let autoTimer = setInterval(() => goTo(currentIndex + 1), AUTO_DELAY);

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(currentIndex + 1), AUTO_DELAY);
    }

    /* Pause on hover or touch, resume on leave */
    viewport.addEventListener('mouseenter', () => clearInterval(autoTimer));
    viewport.addEventListener('mouseleave', () => resetAuto());
    viewport.addEventListener('touchstart',  () => clearInterval(autoTimer), { passive: true });
    viewport.addEventListener('touchend',    () => resetAuto());

    /* Reset timer when user manually navigates */
    prevBtn.addEventListener('click', resetAuto);
    nextBtn.addEventListener('click', resetAuto);

    /* Initialise & re-calculate on resize */
    function init() {
      setCardWidth();
      buildDots();
      goTo(0);
    }

    init();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        init();
      }, 120);
    });
  }

  /* -------------------------------------------------------------------
     FLEET IMAGE LOADER
     Local images take priority; Wikipedia is the fallback.
     ------------------------------------------------------------------- */
  async function loadWikiImage(card) {
    const wikiPage = card.dataset.wiki;
    if (!wikiPage) return;
    const img = card.querySelector('.fleet-photo');
    if (!img) return;

    /* Try local image first */
    if (img.src && !img.src.endsWith('/')) {
      const localLoad = new Promise(resolve => {
        const probe = new Image();
        probe.onload  = () => resolve(true);
        probe.onerror = () => resolve(false);
        probe.src = img.src;
      });
      const localOk = await localLoad;
      if (localOk) {
        img.onload = () => img.classList.add('loaded');
        img.src = img.src; /* re-trigger onload */
        if (img.complete) img.classList.add('loaded');
        return;
      }
    }

    /* Fallback: Wikipedia */
    const apiUrl = `https://en.wikipedia.org/w/api.php?` +
      `action=query&titles=${encodeURIComponent(wikiPage.replace(/_/g, ' '))}` +
      `&prop=pageimages&format=json&pithumbsize=600&origin=*`;

    try {
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return;
      const data = await res.json();
      const pages = data?.query?.pages;
      if (!pages) return;
      const thumbUrl = Object.values(pages)[0]?.thumbnail?.source;
      if (thumbUrl) {
        img.onload = () => img.classList.add('loaded');
        img.src = thumbUrl;
      }
    } catch (err) { /* placeholder stays */ }
  }

  /* Load images when fleet section scrolls into view */
  const fleetSection = document.getElementById('fleet');
  if (fleetSection) {
    const fleetObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        document.querySelectorAll('[data-wiki]').forEach((card, i) => {
          setTimeout(() => loadWikiImage(card), i * 120);
        });
        fleetObserver.disconnect();
      }
    }, { rootMargin: '200px' });
    fleetObserver.observe(fleetSection);
  }

  /* -------------------------------------------------------------------
     NEWS & NOTICES
     ------------------------------------------------------------------- */
  const newsGrid = document.getElementById('news-grid');
  if (newsGrid && window.NEWS_DATA && window.NEWS_DATA.length) {
    const tagColors = {
      'Inventory':    { bg: 'rgba(29,52,97,.1)',     color: '#1d3461' },
      'Company News': { bg: 'rgba(192,39,45,.1)',    color: '#c0272d' },
      'Notice':       { bg: 'rgba(234,179,8,.12)',   color: '#92680b' },
      'Partnership':  { bg: 'rgba(16,124,67,.1)',    color: '#0e7a40' },
      'Regulatory':   { bg: 'rgba(109,114,128,.12)', color: '#4b5563' }
    };

    window.NEWS_DATA.forEach(item => {
      const tc = tagColors[item.tag] || { bg: 'rgba(29,52,97,.1)', color: '#1d3461' };
      const card = document.createElement('article');
      card.className = 'news-card';
      const imgHtml = item.image
        ? `<div class="news-card-img"><img src="${item.image}" alt="${item.title}" loading="lazy" /></div>`
        : '';
      card.innerHTML = `
        ${imgHtml}
        <div class="news-card-top">
          <span class="news-tag" style="background:${tc.bg};color:${tc.color}">${item.tag}</span>
          <span class="news-date">${item.date}</span>
        </div>
        <h3 class="news-card-title">${item.title}</h3>
        <p class="news-card-excerpt">${item.excerpt}</p>
        <div class="news-card-footer">
          <span class="news-read-more">Read more
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </span>
        </div>`;
      card.addEventListener('click', () => openNewsModal(item, tc));
      newsGrid.appendChild(card);
    });
  }

  /* News modal */
  const newsModal    = document.getElementById('news-modal');
  const newsModalTag   = document.getElementById('news-modal-tag');
  const newsModalDate  = document.getElementById('news-modal-date');
  const newsModalTitle = document.getElementById('news-modal-title');
  const newsModalBody  = document.getElementById('news-modal-body');
  const newsModalClose = document.getElementById('news-modal-close');
  const newsModalOverlay = document.getElementById('news-modal-overlay');

  function openNewsModal(item, tc) {
    newsModalTag.textContent = item.tag;
    newsModalTag.style.background = tc.bg;
    newsModalTag.style.color = tc.color;
    newsModalDate.textContent = item.date;
    newsModalTitle.textContent = item.title;
    // Cover image
    const existingImg = newsModal.querySelector('.news-modal-cover');
    if (existingImg) existingImg.remove();
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.className = 'news-modal-cover';
      img.alt = item.title;
      newsModal.querySelector('.news-modal-inner').prepend(img);
    }
    // Body
    newsModalBody.innerHTML = item.body || '';
    // Footer note
    const existingFooter = newsModal.querySelector('.news-modal-footer-note');
    if (existingFooter) existingFooter.remove();
    if (item.footer) {
      const fn = document.createElement('div');
      fn.className = 'news-modal-footer-note';
      fn.textContent = item.footer;
      newsModalBody.after(fn);
    }
    newsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeNewsModal() {
    newsModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  /* Share functionality */
  window.shareOn = function(platform) {
    const url      = encodeURIComponent(window.location.href);
    const title    = encodeURIComponent(document.getElementById('news-modal-title')?.textContent || 'Eastern Aero News');

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=460');

    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, '_blank', 'width=600,height=520');

    } else if (platform === 'instagram') {
      /* Instagram has no web share URL — best approach is Web Share API on mobile
         or copy link with a note on desktop */
      if (navigator.share) {
        navigator.share({ title: decodeURIComponent(title), url: window.location.href })
          .catch(() => {});
      } else {
        /* Desktop fallback: copy link and show tip */
        navigator.clipboard.writeText(window.location.href).then(() => {
          const btn = document.getElementById('share-ig');
          const orig = btn.querySelector('span').textContent;
          btn.querySelector('span').textContent = 'Link copied!';
          setTimeout(() => { btn.querySelector('span').textContent = orig; }, 2200);
        });
        window.open('https://www.instagram.com/', '_blank');
      }

    } else if (platform === 'copy') {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const label = document.getElementById('copy-label');
        label.textContent = '✓ Copied!';
        setTimeout(() => { label.textContent = 'Copy Link'; }, 2200);
      }).catch(() => {
        prompt('Copy this link:', window.location.href);
      });
    }
  };

  if (newsModalClose) newsModalClose.addEventListener('click', closeNewsModal);
  if (newsModalOverlay) newsModalOverlay.addEventListener('click', closeNewsModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && newsModal?.style.display === 'flex') closeNewsModal(); });

  /* -------------------------------------------------------------------
     GALLERY MOSAIC — auto-cycling cells from window.GALLERY_DATA
     ------------------------------------------------------------------- */
  const galleryMosaic = document.getElementById('gallery-mosaic');
  const galleryEmpty  = document.getElementById('gallery-empty');

  if (galleryMosaic && window.GALLERY_DATA && window.GALLERY_DATA.length) {
    const data      = window.GALLERY_DATA;
    const CELLS     = 7;
    const CELL_KEYS = ['a','b','c','d','e','f','g'];
    /* Each cell cycles at a slightly different speed so they feel independent */
    const INTERVALS = [4200, 3400, 5100, 3800, 4600, 3100, 4900];

    /* Build cell elements */
    const cellEls = CELL_KEYS.map(key => {
      const el = document.createElement('div');
      el.className = `gallery-cell cell-${key}`;
      /* progress bar */
      const bar = document.createElement('div');
      bar.className = 'gallery-cell-bar';
      el.appendChild(bar);
      galleryMosaic.appendChild(el);
      return el;
    });

    /* Create an img or video element for a gallery item */
    function makeMedia(item) {
      let el;
      if (item.type === 'video') {
        el = document.createElement('video');
        el.src = `images/gallery/${item.file}`;
        el.muted = true;
        el.playsInline = true;
        el.loop = true;
        el.autoplay = true;
      } else {
        el = document.createElement('img');
        el.src = `images/gallery/${item.file}`;
        el.alt = item.caption;
      }
      el.className = 'cell-media';
      el.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease;';
      return el;
    }

    /* Flip a cell to a new item with a 3-D rotateY sweep */
    function flipCell(cell, item) {
      const oldEl = cell.querySelector('.cell-media');
      const newEl = makeMedia(item);

      /* Start new element off-screen to the right (rotated away) */
      newEl.style.cssText += ';position:absolute;inset:0;transform:rotateY(90deg);';

      cell.appendChild(newEl);
      if (item.type === 'video') newEl.play().catch(() => {});

      /* Trigger animation in next two frames */
      requestAnimationFrame(() => requestAnimationFrame(() => {
        newEl.style.transition = 'transform .48s cubic-bezier(.4,0,.2,1)';
        newEl.style.transform  = 'rotateY(0deg)';
        if (oldEl) {
          oldEl.style.transition = 'transform .48s cubic-bezier(.4,0,.2,1)';
          oldEl.style.transform  = 'rotateY(-90deg)';
        }
      }));

      /* After animation settle: clean up old, normalise new */
      setTimeout(() => {
        if (oldEl && oldEl.parentNode === cell) oldEl.remove();
        newEl.style.position  = '';
        newEl.style.inset     = '';
        newEl.style.transition = 'transform .4s ease';
        newEl.style.transform  = '';
      }, 520);
    }

    /* Animate the progress bar for a given duration */
    function runBar(cell, duration) {
      const bar = cell.querySelector('.gallery-cell-bar');
      if (!bar) return;
      bar.style.transition = 'none';
      bar.style.width = '0%';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        bar.style.transition = `width ${duration}ms linear`;
        bar.style.width = '100%';
      }));
    }

    /* Initialise each cell with a different starting photo */
    const indices = cellEls.map((_, i) => Math.floor(i * data.length / CELLS) % data.length);

    cellEls.forEach((cell, ci) => {
      /* Place first media (no flip, just insert) */
      const first = makeMedia(data[indices[ci]]);
      cell.insertBefore(first, cell.querySelector('.gallery-cell-bar'));
      if (data[indices[ci]].type === 'video') first.play().catch(() => {});

      runBar(cell, INTERVALS[ci]);

      /* Click → lightbox */
      cell.addEventListener('click', () => {
        const img = cell.querySelector('img.cell-media');
        if (img?.src) openLightbox(img.src, data[indices[ci]].caption);
      });

      /* Stagger the first cycle so all cells don't flip at once */
      const delay = ci * 620;
      setTimeout(() => {
        setInterval(() => {
          indices[ci] = (indices[ci] + 1) % data.length;
          flipCell(cell, data[indices[ci]]);
          runBar(cell, INTERVALS[ci]);
        }, INTERVALS[ci]);
      }, delay);
    });

  } else if (galleryEmpty) {
    galleryEmpty.style.display = 'block';
  }

  /* Lightbox */
  let lightbox = null;

  function openLightbox(src, caption) {
    if (lightbox) return;
    lightbox = document.createElement('div');
    lightbox.style.cssText = `
      position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.92);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      cursor:zoom-out;padding:1.5rem;`;
    lightbox.innerHTML = `
      <img src="${src}" alt="${caption}" style="max-height:85vh;max-width:95vw;border-radius:10px;object-fit:contain;box-shadow:0 20px 60px rgba(0,0,0,.6);" />
      <p style="color:rgba(255,255,255,.7);margin-top:1rem;font-size:.9rem;letter-spacing:.08em;text-transform:uppercase;">${caption}</p>`;
    lightbox.addEventListener('click', () => { document.body.removeChild(lightbox); lightbox = null; });
    document.body.appendChild(lightbox);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox) { document.body.removeChild(lightbox); lightbox = null; }
  });

  /* -------------------------------------------------------------------
     TURNSTILE — anti-AI/bot verification state
     ------------------------------------------------------------------- */
  let turnstileVerified = false;

  window.onTurnstileSuccess = function(token) {
    turnstileVerified = true;
    const err = document.getElementById('turnstile-error');
    if (err) err.style.display = 'none';
  };

  window.onTurnstileExpired = function() {
    turnstileVerified = false;
  };

  /* -------------------------------------------------------------------
     CONTACT FORM
     ------------------------------------------------------------------- */
  const form = document.getElementById('contact-form');
  if (form) {

    /* Pre-select subject from URL param: index.html#contact?subject=rfq */
    const urlParams = new URLSearchParams(window.location.search);
    const preSubject = urlParams.get('subject');
    if (preSubject) {
      const subjectEl = form.querySelector('#subject');
      if (subjectEl) subjectEl.value = preSubject;
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');

      /* Collect fields */
      const name     = form.querySelector('#name').value.trim();
      const company  = form.querySelector('#company').value.trim();
      const email    = form.querySelector('#email').value.trim();
      const phone    = form.querySelector('#phone').value.trim();
      const subject  = form.querySelector('#subject').value;
      const message  = form.querySelector('#message').value.trim();

      /* Basic validation */
      if (!name || !company || !email || !message) {
        alert('Please fill in all required fields.');
        return;
      }

      /* Turnstile verification check */
      if (!turnstileVerified) {
        const err = document.getElementById('turnstile-error');
        if (err) err.style.display = 'block';
        document.querySelector('.turnstile-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      /* Route email based on topic */
      const recipientMap = {
        rfq:       'rfq@eastern-aero.com',
        exchange:  'sales@eastern-aero.com',
        repair:    'repairs@eastern-aero.com',
        inventory: 'sales@eastern-aero.com',
        other:     'info@eastern-aero.com'
      };
      const recipient = recipientMap[subject] || 'info@eastern-aero.com';

      const subjectLabels = {
        rfq:       'Request for Quote (RFQ)',
        exchange:  'Exchange / Loan Program',
        repair:    'Repair Management',
        inventory: 'Inventory Management',
        other:     'General Inquiry'
      };
      const subjectLabel = subjectLabels[subject] || 'General Inquiry';

      const bodyText = `Name: ${name}\nCompany: ${company}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nTopic: ${subjectLabel}\n\n${message}`;

      btn.textContent = 'Sending…';
      btn.disabled = true;

      try {
        const res = await fetch(`https://formsubmit.co/ajax/${recipient}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            _subject: `[Eastern Aero] ${subjectLabel} — ${company}`,
            message: bodyText,
            _captcha: 'false',
            _template: 'table'
          })
        });

        if (res.ok) {
          btn.textContent = '✓ Message Sent!';
          btn.style.background = '#16a34a';
          form.reset();
          setTimeout(() => {
            btn.textContent = 'Send Message';
            btn.style.background = '';
            btn.disabled = false;
          }, 4000);
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        /* Fallback: open default mail client */
        const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent('[Eastern Aero] ' + subjectLabel + ' — ' + company)}&body=${encodeURIComponent(bodyText)}`;
        window.location.href = mailtoUrl;
        btn.textContent = 'Send Message';
        btn.style.background = '';
        btn.disabled = false;
      }
    });
  }

  /* --- Active nav link on scroll --- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
    navLinks.forEach(link => {
      link.style.color = link.getAttribute('href') === '#' + current ? 'var(--red)' : '';
    });
  }, { passive: true });

  /* -------------------------------------------------------------------
     LIVE OFFICE CLOCKS
     ------------------------------------------------------------------- */
  const clockEls = document.querySelectorAll('.office-clock[data-tz]');
  if (clockEls.length) {
    function tickClocks() {
      const now = Date.now();
      clockEls.forEach(el => {
        try {
          const timeStr = new Intl.DateTimeFormat('en-GB', {
            timeZone: el.dataset.tz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).format(now);
          el.textContent = timeStr;
        } catch (e) { /* unsupported tz — leave placeholder */ }
      });
    }
    tickClocks();
    setInterval(tickClocks, 1000);
  }

  /* -------------------------------------------------------------------
     FLIP BOARD — Overhauled Parts Carousel (Airport Solari Style)
     ------------------------------------------------------------------- */
  (function () {
    const boardBody = document.getElementById('flip-board-body');
    if (!boardBody || !window.INVENTORY_DATA) return;

    /* Filter to Overhauled + Available only */
    const raw = window.INVENTORY_DATA.filter(p =>
      p['Condition'] === 'Overhauled' && p['Status'] === 'Available'
    );

    /* Consolidate duplicate PNs, sum qty */
    const seenMap = new Map();
    raw.forEach(p => {
      const key = p['Part Number'];
      if (!seenMap.has(key)) {
        seenMap.set(key, { ...p });
      } else {
        const ex = seenMap.get(key);
        ex['Qty'] = String((parseInt(ex['Qty']) || 0) + (parseInt(p['Qty']) || 0));
      }
    });
    const parts = Array.from(seenMap.values());
    if (!parts.length) return;

    const ROWS      = Math.min(6, parts.length);
    const FLIP_DUR  = 480;
    const SWAP_AT   = 195;
    const ROW_CYCLE = 4800;
    const STAGGER   = 750;

    /* Build row elements */
    const rowStates = [];
    for (let i = 0; i < ROWS; i++) {
      const row = document.createElement('div');
      row.className = 'flip-row';
      row.innerHTML = `
        <div class="flip-cell"><div class="flip-inner"><span class="flip-pn"></span></div></div>
        <div class="flip-cell"><div class="flip-inner"><span class="flip-desc"></span></div></div>
        <div class="flip-cell" style="display:flex;justify-content:center;"><div class="flip-inner"></div></div>
        <div class="flip-cell" style="display:flex;justify-content:center;"><div class="flip-inner"><span class="flip-qty"></span></div></div>
        <div class="flip-cell" style="display:flex;justify-content:center;"><div class="flip-inner"></div></div>`;
      boardBody.appendChild(row);
      rowStates.push({ el: row, idx: i });
      renderRow(row, parts[i], false);
    }

    function renderRow(row, part, animate) {
      const cells    = row.querySelectorAll('.flip-cell');
      const pnSpan   = cells[0].querySelector('.flip-pn');
      const descSpan = cells[1].querySelector('.flip-desc');
      const condWrap = cells[2].querySelector('.flip-inner');
      const qtySpan  = cells[3].querySelector('.flip-qty');
      const statWrap = cells[4].querySelector('.flip-inner');

      if (animate) {
        cells.forEach(c => { c.classList.remove('flipping'); void c.offsetWidth; c.classList.add('flipping'); });
        setTimeout(swapContent, SWAP_AT);
        setTimeout(() => cells.forEach(c => c.classList.remove('flipping')), FLIP_DUR);
      } else {
        swapContent();
      }

      function swapContent() {
        pnSpan.textContent   = part['Part Number'] || '—';
        descSpan.textContent = part['Description'] || '—';
        qtySpan.textContent  = part['Qty']         || '1';
        condWrap.innerHTML   = `<span class="cond-badge oh">Overhauled</span>`;
        statWrap.innerHTML   = `<span class="status-badge avail">Available</span>`;
      }
    }

    /* Staggered independent cycling per row */
    rowStates.forEach((r, i) => {
      setTimeout(() => {
        setInterval(() => {
          r.idx = (r.idx + ROWS) % parts.length;
          renderRow(r.el, parts[r.idx], true);
        }, ROW_CYCLE);
      }, i * STAGGER);
    });
  })();

})();
