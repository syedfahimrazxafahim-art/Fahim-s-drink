// ============================================================
// JUICE BOTTLE SCROLL ANIMATION &bull; 240 FRAMES CLEAN CANVAS
// High Performance Scrollytelling & Interactive Drag Scrubber
// ============================================================

const TOTAL_FRAMES = 240;
const FRAME_BASE_PATH = '/frames/ezgif-frame-';
const FRAME_EXTENSION = '.jpg';

const canvas = document.getElementById('sequenceCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const scrollContainer = document.getElementById('scrollContainer');
const preloader = document.getElementById('preloader');
const preloadPercent = document.getElementById('preloadPercent');
const scrollHint = document.getElementById('scrollHint');
const heroTitleOverlay = document.getElementById('heroTitleOverlay');

// Frame cache & loading state
const images = new Array(TOTAL_FRAMES);
let loadedCount = 0;
let isFirstFrameReady = false;

// Physics / Scroll / Scrub state
let currentProgress = 0;
let targetProgress = 0;
let displayedFrameIndex = -1;
let isDragging = false;
let startDragY = 0;
let startDragProgress = 0;

function getFrameUrl(index) {
  const pad = String(index).padStart(3, '0');
  return `${FRAME_BASE_PATH}${pad}${FRAME_EXTENSION}`;
}

// 1. Progressive Image Preloading
function preloadFrames() {
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    const frameIdx = i - 1;
    img.src = getFrameUrl(i);

    img.onload = () => {
      images[frameIdx] = img;
      loadedCount++;
      onFrameLoaded(frameIdx);
    };

    img.onerror = () => {
      console.warn(`Frame ${i} load error, skipping.`);
      loadedCount++;
      onFrameLoaded(frameIdx);
    };
  }
}

function onFrameLoaded(frameIdx) {
  // Render frame 0 immediately when it arrives (instant visual feedback)
  if (frameIdx === 0 && !isFirstFrameReady) {
    isFirstFrameReady = true;
    resizeCanvas();
    drawFrame(0, true);
  }

  const percent = Math.min(Math.round((loadedCount / TOTAL_FRAMES) * 100), 100);
  if (preloadPercent) {
    preloadPercent.textContent = `${percent}%`;
  }

  // Dismiss preloader as soon as initial buffer is ready or all loaded
  if (loadedCount >= 15 && preloader && !preloader.classList.contains('fade-out')) {
    setTimeout(() => {
      preloader.classList.add('fade-out');
    }, 200);
  }
}

// 2. Responsive Canvas Resizing with Retina Support
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  if (displayedFrameIndex >= 0) {
    drawFrame(displayedFrameIndex, true);
  }
}

window.addEventListener('resize', resizeCanvas);

// 3. Frame Drawing with Fallback to Nearest Loaded Frame
function drawFrame(frameIndex, forceRedraw = false) {
  if (frameIndex === displayedFrameIndex && !forceRedraw) return;

  // Find nearest loaded image if requested frame is still buffering
  let img = images[frameIndex];
  if (!img || !img.complete || img.naturalWidth === 0) {
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = frameIndex - offset;
      if (prev >= 0 && images[prev] && images[prev].complete) {
        img = images[prev];
        break;
      }
      const next = frameIndex + offset;
      if (next < TOTAL_FRAMES && images[next] && images[next].complete) {
        img = images[next];
        break;
      }
    }
  }

  if (!img || !img.complete || img.naturalWidth === 0) return;
  displayedFrameIndex = frameIndex;

  const cWidth = canvas.width;
  const cHeight = canvas.height;
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

  // Background tint matching edge tones
  ctx.fillStyle = '#fce5ea';
  ctx.fillRect(0, 0, cWidth, cHeight);

  // Aspect-fill / Cover mode so the animation seamlessly fills the screen
  const scale = Math.max(cWidth / imgWidth, cHeight / imgHeight);
  const renderWidth = imgWidth * scale;
  const renderHeight = imgHeight * scale;
  const offsetX = (cWidth - renderWidth) / 2;
  const offsetY = (cHeight - renderHeight) / 2;

  ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
}

// 4. Scroll Tracking
function onScroll() {
  if (isDragging) return;

  const rect = scrollContainer.getBoundingClientRect();
  const totalScroll = scrollContainer.offsetHeight - window.innerHeight;
  const currentScroll = -rect.top;

  let progress = currentScroll / totalScroll;
  progress = Math.max(0, Math.min(1, progress));
  targetProgress = progress;

  // Fade out scroll indicator once user has begun scrolling
  if (scrollHint) {
    if (currentScroll > 40) {
      scrollHint.classList.add('hidden');
    } else {
      scrollHint.classList.remove('hidden');
    }
  }
}

window.addEventListener('scroll', onScroll, { passive: true });

// 5. Interactive Drag Scrubbing on Canvas Area Only
if (scrollContainer) {
  scrollContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startDragY = e.clientY;
    startDragProgress = targetProgress;
  });

  scrollContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      startDragY = e.touches[0].clientY;
      startDragProgress = targetProgress;
    }
  }, { passive: true });
}

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const deltaY = e.clientY - startDragY;
  const deltaProgress = -deltaY / 600;
  let newProgress = startDragProgress + deltaProgress;
  newProgress = Math.max(0, Math.min(1, newProgress));
  targetProgress = newProgress;

  const totalScroll = scrollContainer.offsetHeight - window.innerHeight;
  window.scrollTo({ top: newProgress * totalScroll, behavior: 'instant' });
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

window.addEventListener('touchmove', (e) => {
  if (!isDragging || e.touches.length !== 1) return;
  const deltaY = e.touches[0].clientY - startDragY;
  const deltaProgress = -deltaY / 600;
  let newProgress = startDragProgress + deltaProgress;
  newProgress = Math.max(0, Math.min(1, newProgress));
  targetProgress = newProgress;

  const totalScroll = scrollContainer.offsetHeight - window.innerHeight;
  window.scrollTo({ top: newProgress * totalScroll, behavior: 'instant' });
}, { passive: true });

window.addEventListener('touchend', () => {
  isDragging = false;
});

// 6. 60FPS Lerp Render Loop
function renderLoop() {
  const lerpFactor = 0.15;
  currentProgress += (targetProgress - currentProgress) * lerpFactor;

  const frameIndex = Math.min(
    Math.max(0, Math.floor(currentProgress * (TOTAL_FRAMES - 1))),
    TOTAL_FRAMES - 1
  );

  drawFrame(frameIndex);

  // Fade Fahim's Drink headline and subheadline smoothly, completing fade at 30% scroll
  if (heroTitleOverlay) {
    const fadeThreshold = 0.30;
    if (currentProgress >= fadeThreshold) {
      heroTitleOverlay.style.opacity = '0';
      heroTitleOverlay.style.visibility = 'hidden';
    } else {
      const fadeRatio = currentProgress / fadeThreshold;
      const opacity = Math.max(0, 1 - fadeRatio);
      heroTitleOverlay.style.opacity = opacity.toFixed(3);
      heroTitleOverlay.style.visibility = 'visible';
      heroTitleOverlay.style.transform = `translate(-50%, ${(-fadeRatio * 24).toFixed(1)}px)`;
    }
  }

  requestAnimationFrame(renderLoop);
}

// 7. Initialization
window.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  preloadFrames();
  onScroll();
  updateNavbarOnScroll();
  requestAnimationFrame(renderLoop);
});

// 8. Transparent Navbar & ScrollSpy Controller
const mainNavbar = document.getElementById('mainNavbar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const navItems = document.querySelectorAll('.nav-item');
const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

function updateNavbarOnScroll() {
  if (!mainNavbar) return;
  if (window.scrollY > 40) {
    mainNavbar.classList.add('nav-scrolled');
  } else {
    mainNavbar.classList.remove('nav-scrolled');
  }

  const sections = [
    { id: 'scrollContainer' },
    { id: 'flavor-profile' },
    { id: 'mockup-specs' },
    { id: 'ingredients-nutrition' },
    { id: 'reviews' },
    { id: 'faq' },
    { id: 'order-section' }
  ];

  const scrollPos = window.scrollY + 120;
  let currentSectionId = 'scrollContainer';

  sections.forEach((sec) => {
    const el = document.getElementById(sec.id);
    if (el && el.offsetTop <= scrollPos) {
      currentSectionId = sec.id;
    }
  });

  navItems.forEach((link) => {
    const href = link.getAttribute('href').replace('#', '');
    if (href === currentSectionId) {
      link.classList.add('text-primary', 'font-bold', 'active');
      link.classList.remove('text-on-surface-variant');
    } else {
      link.classList.remove('text-primary', 'font-bold', 'active');
      link.classList.add('text-on-surface-variant');
    }
  });

  mobileNavItems.forEach((link) => {
    const href = link.getAttribute('href').replace('#', '');
    if (href === currentSectionId) {
      link.classList.add('text-primary', 'font-bold');
      link.classList.remove('text-on-surface-variant');
    } else {
      link.classList.remove('text-primary', 'font-bold');
      link.classList.add('text-on-surface-variant');
    }
  });
}

window.addEventListener('scroll', updateNavbarOnScroll, { passive: true });

// Mobile menu toggle
if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
}

