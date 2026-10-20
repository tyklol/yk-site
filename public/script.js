(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  document.getElementById('year').textContent = new Date().getFullYear();

  // Theme: dark by default; the inline script in <head> applies a saved choice before first paint.
  var THEME_KEY = 'yk-theme';
  var toggle = document.getElementById('theme-toggle');
  var themeColor = document.querySelector('meta[name="theme-color"]');

  function syncTheme() {
    var light = root.dataset.theme === 'light';
    toggle.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    themeColor.content = light ? '#fafafa' : '#09090b';
  }

  syncTheme();
  toggle.addEventListener('click', function () {
    var light = root.dataset.theme !== 'light';
    if (light) root.dataset.theme = 'light';
    else delete root.dataset.theme;
    try { localStorage.setItem(THEME_KEY, light ? 'light' : 'dark'); } catch (e) { /* storage unavailable */ }
    syncTheme();
  });

  // Reveal sections as they scroll into view.
  var reveals = document.querySelectorAll('.reveal');
  if (hasIO && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.project-grid > .reveal').forEach(function (el, i) {
      el.style.setProperty('--d', i % 3);
    });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Highlight the nav link for the section in the middle of the screen.
  var navLinks = document.querySelectorAll('.nav-links a');
  if (hasIO) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main > section').forEach(function (s) { navObserver.observe(s); });
  }

  // Cursor spotlight on cards.
  document.addEventListener('pointermove', function (e) {
    var card = e.target.closest && e.target.closest('.spot');
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', e.clientX - r.left + 'px');
    card.style.setProperty('--my', e.clientY - r.top + 'px');
  });

  // Count the hero stats up once the entrance animation has played.
  if (!reduceMotion) {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      var decimals = (el.dataset.count.split('.')[1] || '').length;
      var suffix = el.dataset.suffix || '';
      var start = null;
      el.textContent = (0).toFixed(decimals) + suffix;
      function frame(now) {
        if (start === null) start = now;
        var t = Math.min((now - start) / 1400, 1);
        el.textContent = (target * (1 - Math.pow(1 - t, 3))).toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(frame);
      }
      setTimeout(function () { requestAnimationFrame(frame); }, 500);
    });
  }

  // Project filters.
  var filters = document.querySelectorAll('.filter');
  var projects = document.querySelectorAll('.project');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.dataset.filter;
      filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      projects.forEach(function (p) {
        var show = cat === 'all' || p.dataset.cat.split(' ').indexOf(cat) !== -1;
        p.hidden = !show;
        if (!show) return;
        p.classList.add('is-in');
        if (!reduceMotion) {
          p.classList.remove('pop');
          void p.offsetWidth; // restart the animation
          p.classList.add('pop');
        }
      });
    });
  });

  // Project detail dialog, filled from the clicked card.
  var dialog = document.getElementById('project-dialog');
  document.querySelectorAll('.project-open').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.project');
      var details = card.querySelector('.project-details').cloneNode(true);
      details.hidden = false;
      dialog.querySelector('.dialog-cat').textContent = card.querySelector('.project-cat').textContent;
      dialog.querySelector('.dialog-title').textContent = card.querySelector('h3').textContent;
      dialog.querySelector('.dialog-sum').textContent = card.querySelector('.project-sum').textContent;
      dialog.querySelector('.dialog-body').replaceChildren(details);
      dialog.querySelector('.dialog-tags').innerHTML = card.querySelector('.tags').innerHTML;
      dialog.showModal();
    });
  });
  dialog.addEventListener('click', function (e) {
    // A click on the dialog element itself is a click on the backdrop.
    if (e.target === dialog || e.target.closest('.dialog-close')) dialog.close();
  });

  // Copy email.
  var copyBtn = document.getElementById('copy-email');
  if (navigator.clipboard && window.isSecureContext) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(copyBtn.dataset.email).then(function () {
        copyBtn.textContent = 'Copied ✓';
        setTimeout(function () { copyBtn.textContent = 'Copy email'; }, 2000);
      });
    });
  } else {
    copyBtn.hidden = true;
  }
})();
