/* ============================================
   NIKE SCROLLYTELLING — TIGER EXPERIENCE ENGINE
   ============================================ */

class TigerExperience {
  constructor() {
    // Config
    this.totalFrames = 192;
    this.frameDir = 'frames';
    this.currentFrame = 0;
    this.frames = [];
    this.loadedCount = 0;
    this.isReady = false;

    // DOM
    this.tigerSection = document.getElementById('tiger-section');
    this.stickyEl = document.getElementById('tiger-sticky');
    this.fgCanvas = document.getElementById('tiger-canvas');
    this.bgCanvas = document.getElementById('ambient-canvas');
    this.fgCtx = this.fgCanvas.getContext('2d');
    this.bgCtx = this.bgCanvas.getContext('2d');
    this.heroOverlay = document.getElementById('hero-overlay');
    this.scrollIndicator = document.getElementById('scroll-indicator');
    this.loader = document.getElementById('loader');
    this.loaderBar = document.getElementById('loader-bar');
    this.loaderText = document.getElementById('loader-text');

    // State
    this.rafId = null;
    this.needsRender = true;
    this.resizeTimer = null;

    this.init();
  }

  /* ----- Generate frame path ----- */
  getFramePath(index) {
    const padded = String(index).padStart(3, '0');
    return `${this.frameDir}/frame_${padded}_delay-0.042s.webp`;
  }

  /* ----- Preload all frames ----- */
  preloadFrames() {
    return new Promise((resolve) => {
      let loaded = 0;

      for (let i = 0; i < this.totalFrames; i++) {
        const img = new Image();
        img.src = this.getFramePath(i);

        img.onload = () => {
          loaded++;
          this.loadedCount = loaded;
          const pct = Math.round((loaded / this.totalFrames) * 100);
          this.loaderBar.style.width = `${pct}%`;
          this.loaderText.textContent = `${pct}% loaded`;

          if (loaded === this.totalFrames) {
            resolve();
          }
        };

        img.onerror = () => {
          loaded++;
          if (loaded === this.totalFrames) {
            resolve();
          }
        };

        this.frames[i] = img;
      }
    });
  }

  /* ----- Size canvases to viewport ----- */
  setupCanvases() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Foreground
    this.fgCanvas.width = w * dpr;
    this.fgCanvas.height = h * dpr;
    this.fgCanvas.style.width = `${w}px`;
    this.fgCanvas.style.height = `${h}px`;
    this.fgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Ambient (slightly larger for blur coverage)
    this.bgCanvas.width = w * dpr;
    this.bgCanvas.height = h * dpr;
    this.bgCanvas.style.width = `${w}px`;
    this.bgCanvas.style.height = `${h}px`;
    this.bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.canvasW = w;
    this.canvasH = h;
    this.needsRender = true;
  }

  /* ----- Draw current frame on foreground (contain + zoom to crop watermark) ----- */
  drawContain(ctx, img, cw, ch) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const imgRatio = iw / ih;
    const canvasRatio = cw / ch;
    const zoom = 1.15; // Zoom in to crop out Veo watermark

    let dw, dh, dx, dy;

    if (imgRatio > canvasRatio) {
      dw = cw * zoom;
      dh = (cw / imgRatio) * zoom;
    } else {
      dh = ch * zoom;
      dw = (ch * imgRatio) * zoom;
    }

    dx = (cw - dw) / 2;
    dy = (ch - dh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  /* ----- Draw current frame on background (cover, zoomed) ----- */
  drawCover(ctx, img, cw, ch) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const imgRatio = iw / ih;
    const canvasRatio = cw / ch;

    let sw, sh, sx, sy;

    if (imgRatio > canvasRatio) {
      sh = ih;
      sw = ih * canvasRatio;
    } else {
      sw = iw;
      sh = iw / canvasRatio;
    }

    sx = (iw - sw) / 2;
    sy = (ih - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  }

  /* ----- Render frame to both canvases ----- */
  renderFrame(index) {
    const clampedIndex = Math.max(0, Math.min(index, this.totalFrames - 1));
    const img = this.frames[clampedIndex];
    if (!img) return;

    this.drawContain(this.fgCtx, img, this.canvasW, this.canvasH);
    this.drawCover(this.bgCtx, img, this.canvasW, this.canvasH);
    this.currentFrame = clampedIndex;
  }

  /* ----- rAF render loop ----- */
  startRenderLoop() {
    const tick = () => {
      if (this.needsRender) {
        this.renderFrame(this.currentFrame);
        this.needsRender = false;
      }
      this.rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  /* ----- GSAP ScrollTrigger ----- */
  setupScrollTrigger() {
    gsap.registerPlugin(ScrollTrigger);

    // Frame scrub
    ScrollTrigger.create({
      trigger: this.tigerSection,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const frameIndex = Math.round(self.progress * (this.totalFrames - 1));
        if (frameIndex !== this.currentFrame) {
          this.currentFrame = frameIndex;
          this.needsRender = true;
        }
      }
    });

    // Hero overlay fade out
    gsap.to(this.heroOverlay, {
      opacity: 0,
      scale: 0.9,
      scrollTrigger: {
        trigger: this.tigerSection,
        start: 'top top',
        end: '15% top',
        scrub: true
      }
    });

    // Scroll indicator hide
    ScrollTrigger.create({
      trigger: this.tigerSection,
      start: '2% top',
      onEnter: () => this.scrollIndicator.classList.add('hidden'),
      onLeaveBack: () => this.scrollIndicator.classList.remove('hidden')
    });

    // Reveal animations for post-hero sections
    document.querySelectorAll('.section').forEach(section => {
      const revealEls = [
        section.querySelector('.eyebrow'),
        section.querySelector('.section-title'),
        section.querySelector('.section-title-sm'),
        section.querySelector('.section-desc'),
        section.querySelector('.btn-group'),
        section.querySelector('.intro-product-image'),
        section.querySelector('.carousel-header'),
        section.querySelector('.carousel-track'),
        section.querySelector('.essentials-grid'),
        section.querySelector('.banner-content')
      ].filter(Boolean);

      revealEls.forEach((el, i) => {
        el.classList.add('reveal');
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            setTimeout(() => el.classList.add('visible'), i * 100);
          }
        });
      });
    });
  }

  /* ----- Lenis smooth scroll ----- */
  setupLenis() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Sync Lenis with GSAP ticker
    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  /* ----- Carousel controls ----- */
  setupCarousel() {
    const track = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (!track || !prevBtn || !nextBtn) return;

    const scrollAmount = 296; // card width + gap

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Update button states
    const updateButtons = () => {
      prevBtn.disabled = track.scrollLeft <= 0;
      nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };

    track.addEventListener('scroll', updateButtons);
    updateButtons();
  }

  /* ----- Debounced resize ----- */
  onResize() {
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.setupCanvases();
        ScrollTrigger.refresh();
      }, 200);
    });
  }

  /* ----- Hide loader ----- */
  hideLoader() {
    this.loader.classList.add('hidden');
    setTimeout(() => {
      this.loader.style.display = 'none';
    }, 700);
  }

  /* ----- Init ----- */
  async init() {
    this.setupCanvases();

    // Preload frames
    await this.preloadFrames();

    // Render first frame
    this.currentFrame = 0;
    this.needsRender = true;
    this.renderFrame(0);

    // Hide loader
    this.hideLoader();

    // Start systems
    this.startRenderLoop();
    this.setupLenis();
    this.setupScrollTrigger();
    this.setupCarousel();
    this.onResize();

    this.isReady = true;
  }
}

// Launch on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new TigerExperience();
});
