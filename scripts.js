document.addEventListener('DOMContentLoaded', function () {
  // Mobile hamburger menu toggle
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');

  if (navToggle && mobileMenu) {
    // Toggle menu on hamburger click
    navToggle.addEventListener('click', () => {
      const isActive = mobileMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', isActive);
    });

    // Close menu when a link is clicked
    mobileMenuItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', false);
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-toggle') && !e.target.closest('.mobile-menu')) {
        mobileMenu.classList.remove('active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', false);
      }
    });
  }

  // Toast helper
  const toastEl = document.getElementById('toast');
  function showToast(message, ms = 3500) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.remove('hidden');
    toastEl.classList.add('visible');
    clearTimeout(toastEl._hideTimeout);
    toastEl._hideTimeout = setTimeout(() => {
      toastEl.classList.remove('visible');
      toastEl.classList.add('hidden');
    }, ms);
  }

  // Simple validation helpers
  function isEmail(value) {
    return /\S+@\S+\.\S+/.test(value);
  }

  // Quick ping form
  const quickPing = document.getElementById('quick-ping-form');
  if (quickPing) {
    quickPing.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('qp-name');
      const message = document.getElementById('qp-message');
      if (!name.value.trim() || !message.value.trim()) {
        showToast('Please enter your name and message.');
        return;
      }
      // Simulate sending - you can replace this with a real API call
      showToast('Thanks! Your quick ping was sent.');
      quickPing.reset();
    });
  }

  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('c-name');
      const email = document.getElementById('c-email');
      const details = document.getElementById('c-details');

      if (!name.value.trim() || !email.value.trim() || !details.value.trim()) {
        showToast('Please complete all required fields.');
        return;
      }
      if (!isEmail(email.value)) {
        showToast('Please provide a valid email address.');
        return;
      }

      // Example: create a mailto fallback so the user can continue if no backend is configured
      const subject = encodeURIComponent('Project inquiry from ' + name.value.trim());
      const body = encodeURIComponent(details.value.trim() + '\n\nContact email: ' + email.value.trim());
      const mailto = `mailto:hello@anisha.tech?subject=${subject}&body=${body}`;

      // Try opening mail client; this is a fallback UX. For production replace with API call.
      window.location.href = mailto;
      showToast('Opening your mail client to send the inquiry...');
      contactForm.reset();
    });
  }

  // Accessibility: hide mobile nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!navLinks) return;
    if (navLinks.classList.contains('mobile-visible')) {
      const inside = navLinks.contains(e.target) || (navToggle && navToggle.contains(e.target));
      if (!inside) navLinks.classList.remove('mobile-visible');
    }
  });

  // Hero image editor: upload, drag & drop, download, clear, persist in localStorage
  (function heroEditor() {
    const heroImg = document.getElementById('hero-img');
    const heroInput = document.getElementById('hero-input');
    const heroDownload = document.getElementById('hero-download');
    const heroClear = document.getElementById('hero-clear');
    const heroContainer = document.getElementById('hero-container');
    if (!heroImg || !heroInput || !heroContainer) return;

    const STORAGE_KEY = 'heroImage';
    const originalSrc = heroImg.src;

    // Clear any previously saved custom hero image so the local media file is used
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }

    // If a saved image exists in localStorage, use it (only if user uploaded in this browser session)
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      heroImg.src = saved;
    }

    function setImageFromFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = function (ev) {
        heroImg.src = ev.target.result;
        try { localStorage.setItem(STORAGE_KEY, ev.target.result); } catch (e) { console.warn('Could not persist image to localStorage', e); }
      };
      reader.readAsDataURL(file);
    }

    heroInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      setImageFromFile(file);
      // reset input so the same file can be re-selected later
      heroInput.value = '';
    });

    // Drag & drop
    ['dragenter', 'dragover'].forEach(evt => {
      heroContainer.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); heroContainer.classList.add('hero-drop-over'); });
    });
    ['dragleave', 'drop'].forEach(evt => {
      heroContainer.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); heroContainer.classList.remove('hero-drop-over'); });
    });
    heroContainer.addEventListener('drop', (e) => {
      const item = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      setImageFromFile(item);
    });

    // Download current image (if data URL or fetchable)
    heroDownload.addEventListener('click', async () => {
      const src = heroImg.src;
      try {
        if (src.startsWith('data:')) {
          // convert dataURL to blob
          const res = await fetch(src);
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'hero-image.png';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        } else {
          // try fetch remote/local path
          const res = await fetch(src);
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          // try to derive extension
          const ext = (blob.type && blob.type.split('/')[1]) || 'png';
          a.download = `hero-image.${ext}`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        showToast('Unable to download image.');
        console.error(err);
      }
    });

    // Clear custom image and revert to original
    heroClear.addEventListener('click', () => {
      heroImg.src = originalSrc;
      localStorage.removeItem(STORAGE_KEY);
      showToast('Reverted portrait to original.');
    });
  })();

  // Dock nav scroll spy: highlight active section as you scroll
  (function scrollSpy() {
    const navItems = document.querySelectorAll('.dock-nav-item');
    const sections = ['hero', 'about', 'skills', 'projects', 'education', 'contact'];

    function updateActiveSection() {
      let activeSection = 'hero'; // Default to hero
      let maxVisibility = 0;

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (!section) continue;

        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate how much of the section is visible
        const top = Math.max(0, rect.top);
        const bottom = Math.min(windowHeight, rect.bottom);
        const visibility = Math.max(0, bottom - top) / windowHeight;

        if (visibility > maxVisibility) {
          maxVisibility = visibility;
          activeSection = sectionId;
        }
      }

      // Update active state on nav items
      navItems.forEach(item => {
        const section = item.getAttribute('data-section');
        if (section === activeSection) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }

    // Initial call and listen to scroll
    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection, { passive: true });
  })();

  // Reveal animations for project cards when they scroll into view
  (function projectReveal() {
    const cards = document.querySelectorAll('.project-card');
    if (!cards || !cards.length) return;
    cards.forEach((c, i) => {
      c.classList.add('reveal');
      // staggered delays for nicer entrance
      c.style.transitionDelay = `${i * 150}ms`;
      
      // Add subtle rotation for each card alternating left/right
      c.style.transform = `translateY(18px) rotate(${i % 2 === 0 ? '-1' : '1'}deg)`;
    });

    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          // Reset rotation after animation completes
          setTimeout(() => {
            entry.target.style.transform = 'none';
          }, 560);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    cards.forEach(c => obs.observe(c));
  })();

  // Scroll animations for various elements
  (function scrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add fade-in and slide-up animations
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    // Observe all skill cards
    document.querySelectorAll('.skills-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      observer.observe(card);
    });

    // Observe all elements with section-underline
    document.querySelectorAll('.section-underline').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      observer.observe(el);
    });

    // Observe all grid items and list items
    document.querySelectorAll('h2, h3, p').forEach(el => {
      const parent = el.closest('section');
      if (parent && parent.id) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(15px)';
        el.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
        observer.observe(el);
      }
    });
  })();
});