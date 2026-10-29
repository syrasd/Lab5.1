/**
 * main.js
 * Controller for Syeda Shafia Haider's Portfolio
 * - Silky-Smooth Zero-Flash Crossfade Engine
 * - Exact Angle Mapping:
 *     home:      Left Profile (Face Left Side)
 *     skills:    Left Three-Quarter
 *     projects:  Front
 *     education: Right Three-Quarter
 *     contact:   Right Profile
 * - Reduced Card Blur (8px) for High Text Prominence
 */

// 1. Preload all 5 photoshoot images in browser memory for instant zero-latency transitions
const BACKGROUND_IMAGES = [
  'assets/images/bg-home-left-profile.jpg',
  'assets/images/bg-skills-left-three-quarter.jpg',
  'assets/images/bg-projects-front.jpg',
  'assets/images/bg-education-right-three-quarter.jpg',
  'assets/images/bg-contact-right-profile.jpg'
];

BACKGROUND_IMAGES.forEach((src) => {
  const img = new Image();
  img.src = src;
});

document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.section-stage');
  const navLinks = document.querySelectorAll('.nav-item-link');
  const bgLayers = document.querySelectorAll('.bg-angle-layer');
  let currentActive = 'home';

  // Silky Smooth Cross-Dissolve Transition
  function setActiveSection(targetSectionId) {
    if (currentActive === targetSectionId) return;

    const prevSectionId = currentActive;
    currentActive = targetSectionId;

    // 1. Update Top Pill Nav
    navLinks.forEach((link) => {
      const target = link.dataset.target || link.getAttribute('href').replace('#', '');
      if (target === targetSectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // 1b. Swap the visible "page" (single-page: no scrolling)
    sections.forEach((sec) => {
      const isTarget = sec.id === targetSectionId;
      sec.classList.toggle('active', isTarget);
      if (isTarget) sec.scrollTop = 0;
    });

    // 2. Cinematic Cross-Dissolve:
    // Outgoing layer remains fully opaque underneath (z-index: 1)
    // Incoming layer dissolves on top (z-index: 2, fades from 0 to 1)
    const prevLayer = document.querySelector(`.bg-angle-layer[data-section="${prevSectionId}"]`);
    const nextLayer = document.querySelector(`.bg-angle-layer[data-section="${targetSectionId}"]`);

    if (prevLayer) {
      prevLayer.classList.remove('active');
      prevLayer.classList.add('fading-out');
    }

    if (nextLayer) {
      nextLayer.classList.add('active');
      nextLayer.classList.remove('fading-out');
    }

    // Clean up outgoing layer after fade completes (950ms)
    setTimeout(() => {
      if (prevLayer && prevLayer !== nextLayer) {
        prevLayer.classList.remove('fading-out');
      }
    }, 950);

    // 3. Trigger Three.js Depth Camera Zoom Pulse
    if (typeof window.triggerThreeZoom === 'function') {
      window.triggerThreeZoom();
    }
  }

  // Show a section (no scrolling) and keep the URL hash in sync
  function goTo(targetId, pushHistory = true) {
    if (!document.getElementById(targetId)) return;
    setActiveSection(targetId);
    if (pushHistory && location.hash !== '#' + targetId) {
      history.pushState(null, '', '#' + targetId);
    }
  }

  // Nav links + Hero CTA buttons (any in-page "#section" link)
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.length > 1) {
        e.preventDefault();
        goTo(href.slice(1));
      }
    });
  });

  // Browser back/forward buttons
  window.addEventListener('popstate', () => {
    const id = location.hash.slice(1) || 'home';
    goTo(id, false);
  });

  // Open directly on a section if the URL has a hash (e.g. index.html#skills)
  if (location.hash.length > 1) {
    goTo(location.hash.slice(1), false);
  }

  // 3D Card Tilt & Specular Glare Physics
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach((card) => {
    if (!card.querySelector('.card-glare')) {
      const glare = document.createElement('div');
      glare.className = 'card-glare';
      card.appendChild(glare);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotX = ((y - centerY) / centerY) * -7;
      const rotY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(10px)`;
      card.style.setProperty('--glare-x', `${x}px`);
      card.style.setProperty('--glare-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  });

  // Mouse Parallax for Background Subject
  window.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', (e.clientX / window.innerWidth - 0.5).toFixed(3));
    document.documentElement.style.setProperty('--mouse-y', (e.clientY / window.innerHeight - 0.5).toFixed(3));
  });

  // Dark & Light Mode Theme
  const themeBtn = document.getElementById('theme-switch-btn');
  const storedTheme = localStorage.getItem('shafia_exact_theme') || 'dark';

  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('shafia_exact_theme', t);
  }

  setTheme(storedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }

  // Contact Form & Toast Notice
  const contactForm = document.getElementById('contact-form');
  const toast = document.getElementById('toast-msg-box');

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Sending...</span>`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        contactForm.reset();
        showToast('Message sent! Syeda Shafia will get back to you shortly.');
      }, 1000);
    });
  }
});
