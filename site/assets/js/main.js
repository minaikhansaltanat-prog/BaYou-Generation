/* ==========================================================================
   BaYou Generation — site behavior
   - bilingual KZ/RU toggle (data-kz / data-ru text swap)
   - mobile slide-in menu (hamburger + overlay + X close + Esc + outside click)
   - header scroll shadow
   - scroll-reveal (IntersectionObserver, respects prefers-reduced-motion)
   - animated stat counters
   - FAQ accordion
   - reviews tabs (video / written / audio / 2gis)
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Language toggle ---------------- */
  var LANG_KEY = 'bayou-lang';
  var currentLang = localStorage.getItem(LANG_KEY) || 'kz';

  var titles = {
    kz: 'BaYou Generation — Балабақшаны AI арқылы басқару платформасы',
    ru: 'BaYou Generation — AI-платформа для управления детским садом'
  };
  var metaDescriptions = {
    kz: 'BaYou Generation (BAQSHA Platform) — балабақша директорларына арналған AI операциялық жүйе: тапсырыс, контент, жариялау, чат-бот, тіркеу CRM бір платформада.',
    ru: 'BaYou Generation (BAQSHA Platform) — AI-операционная система для директоров детских садов: заказы, контент, публикации, чат-бот и CRM в одной платформе.'
  };

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute('lang', lang === 'kz' ? 'kk' : 'ru');

    document.querySelectorAll('[data-kz]').forEach(function (el) {
      var value = el.getAttribute('data-' + lang);
      if (value !== null) el.textContent = value;
    });
    document.querySelectorAll('[data-kz-html]').forEach(function (el) {
      var value = el.getAttribute('data-' + lang + '-html');
      if (value !== null) el.innerHTML = value;
    });
    document.querySelectorAll('[data-kz-ph]').forEach(function (el) {
      var value = el.getAttribute('data-' + lang + '-ph');
      if (value !== null) el.setAttribute('placeholder', value);
    });
    document.querySelectorAll('[data-kz-aria]').forEach(function (el) {
      var value = el.getAttribute('data-' + lang + '-aria');
      if (value !== null) el.setAttribute('aria-label', value);
    });

    document.title = titles[lang];
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', metaDescriptions[lang]);

    document.querySelectorAll('.lang-pill button').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-lang]');
    if (btn) applyLang(btn.getAttribute('data-lang'));
  });

  /* ---------------- Mobile menu ---------------- */
  var burger = document.getElementById('burgerBtn');
  var overlay = document.getElementById('mobileOverlay');
  var panel = document.getElementById('mobilePanel');
  var closeBtn = document.getElementById('mobileCloseBtn');

  function openMenu() {
    overlay.classList.add('is-open');
    panel.classList.add('is-open');
    document.documentElement.classList.add('no-scroll');
    burger.setAttribute('aria-expanded', 'true');
    closeBtn.focus();
  }
  function closeMenu() {
    overlay.classList.remove('is-open');
    panel.classList.remove('is-open');
    document.documentElement.classList.remove('no-scroll');
    burger.setAttribute('aria-expanded', 'false');
    burger.focus();
  }
  if (burger) {
    burger.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) closeMenu();
    });
    panel.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('click', function () {
        if (el.tagName === 'A') closeMenu();
      });
    });
  }

  /* ---------------- Header scroll shadow ---------------- */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (window.scrollY > 12) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------- Stat counters ---------------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (prefersReducedMotion) { el.textContent = target + suffix; return; }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  var countEls = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var countIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    countEls.forEach(function (el) { countIo.observe(el); });
  }

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var question = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item').forEach(function (other) {
        other.classList.remove('is-open');
        other.querySelector('.faq-answer').style.maxHeight = null;
        other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------------- Reviews tabs ---------------- */
  var tabButtons = document.querySelectorAll('.tab-btn');
  var tabPanels = document.querySelectorAll('.tab-panel');
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-tab');
      tabButtons.forEach(function (b) { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); });
      tabPanels.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-tab-panel') === target); });
    });
  });

  /* ---------------- Contact form -> WhatsApp deep link ---------------- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = contactForm.querySelector('#cf-name').value.trim();
      var garden = contactForm.querySelector('#cf-garden').value.trim();
      var phone = contactForm.querySelector('#cf-phone').value.trim();
      var message = contactForm.querySelector('#cf-message').value.trim();

      var lines = currentLang === 'ru'
        ? ['Здравствуйте! Хочу запросить демо BaYou Generation.', 'Имя: ' + name, 'Детский сад: ' + garden, 'Телефон: ' + phone]
        : ['Сәлеметсіз бе! BaYou Generation туралы демо алғым келеді.', 'Аты-жөні: ' + name, 'Балабақша: ' + garden, 'Телефон: ' + phone];
      if (message) lines.push((currentLang === 'ru' ? 'Сообщение: ' : 'Хабарлама: ') + message);

      var text = encodeURIComponent(lines.join('\n'));
      window.open('https://wa.me/77086279544?text=' + text, '_blank', 'noopener');
    });
  }

  /* ---------------- Init ---------------- */
  applyLang(currentLang);
  var yearEl = document.getElementById('yearNow');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
