(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function initScroll() {
    var bar = null;
    if (!reduce) {
      bar = document.createElement('div');
      bar.className = 'bb-progress';
      bar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bar);
    }
    var nav = document.getElementById('site-header');
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
      if (nav) nav.classList.toggle('is-scrolled', y > 8);
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  function initHero() {
    var visual = document.querySelector('[data-hero-visual]');
    if (!visual) return;
    var slides = [].slice.call(visual.querySelectorAll('.hero-slide'));
    var caption = visual.querySelector('[data-hero-caption]');
    if (slides.length < 2) return;
    var i = 0, timer = null, held = false;

    var root = document.documentElement;
    var SLIDE_MS = 2000;


    slides.forEach(function (sl) {
      var im = sl.querySelector('img');
      if (!im) return;
      im.loading = 'eager';
      if (im.decode) { im.decode().catch(function () {}); }
    });

    function show(n) {
      slides[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active');
      if (caption) caption.textContent = slides[i].getAttribute('data-caption') || '';
    }
    function reset() {
      slides.forEach(function (sl) { sl.classList.remove('is-active'); });
      i = 0;
      slides[0].classList.add('is-active');
      if (caption) caption.textContent = slides[0].getAttribute('data-caption') || '';
    }
    function start() { if (reduce || timer) return; timer = setInterval(function () { if (!held && !document.hidden) show(i + 1); }, SLIDE_MS); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }


    function whenHomeVisible() {
      if (!root.classList.contains('intro-pending')) return;
      stop();
      var mo = new MutationObserver(function () {
        if (root.classList.contains('intro-pending')) return;
        mo.disconnect();
        reset();
        start();
      });
      mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    }

    visual.addEventListener('mouseenter', function () { held = true; });
    visual.addEventListener('mouseleave', function () { held = false; });
    visual.addEventListener('focusin', function () { held = true; });
    visual.addEventListener('focusout', function () { held = false; });
    if (root.classList.contains('intro-pending')) { reset(); whenHomeVisible(); } else { start(); }

    if (finePointer && !reduce) {
      var hero = visual.closest('.hero') || visual;
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        visual.style.setProperty('--tx', (x * 18).toFixed(1) + 'px');
        visual.style.setProperty('--ty', (y * 18).toFixed(1) + 'px');
      });
      hero.addEventListener('pointerleave', function () {
        visual.style.setProperty('--tx', '0px');
        visual.style.setProperty('--ty', '0px');
      });
    }
  }

  function initSpotlight() {
    if (!finePointer || reduce) return;
    var raf = 0;
    document.addEventListener('pointermove', function (e) {
      var card = e.target && e.target.closest ? e.target.closest('.product-card') : null;
      if (!card) return;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    }, { passive: true });
  }

  function initCountUp() {
    var els = [].slice.call(document.querySelectorAll('.stat-card strong'));
    if (!els.length || reduce || !('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        obs.unobserve(en.target);
        var el = en.target, text = el.textContent.trim();
        var m = text.match(/^([^0-9]*)([\d,]+)(.*)$/);
        if (!m) return;
        var target = parseInt(m[2].replace(/,/g, ''), 10), start = null, dur = 1400;
        if (!isFinite(target) || target < 2) return;
        function step(t) {
          if (start === null) start = t;
          var p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3);
          el.textContent = m[1] + Math.round(target * e).toLocaleString('en-US') + m[3];
          if (p < 1) requestAnimationFrame(step); else el.textContent = text;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { obs.observe(el); });
  }

  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    try { initScroll(); initHero(); initSpotlight(); initCountUp(); } catch (e) { }
  });
})();
