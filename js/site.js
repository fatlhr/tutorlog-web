// TutorLog Web — site.js
// Hamburger menu overlay + login demo flow + salin link. Lihat SPEC.md.

(function () {
  // ---- Menu overlay ----
  var menu = document.getElementById('mobMenu');
  var menuToggles = document.querySelectorAll('[data-menu-toggle]');
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    menuToggles.forEach(function (b) {
      b.setAttribute('aria-expanded', String(open));
    });
  }
  menuToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setMenu(menu && menu.hidden);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && !menu.hidden) setMenu(false);
  });

  // ---- Login demo: submit → sent/?email=... ----
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (document.getElementById('loginEmail') || {}).value || '';
      window.location.href = 'sent/?email=' + encodeURIComponent(email);
    });
  }

  // ---- Login sent: isi badge dari ?email= ----
  var badge = document.getElementById('emailBadge');
  if (badge) {
    var m = new URLSearchParams(window.location.search).get('email');
    if (m) badge.textContent = m;
  }

  // ---- Salin link (app/invoice) ----
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var label = btn.querySelector('span');
      var done = function () {
        if (!label) return;
        var old = label.textContent;
        label.textContent = 'Tersalin!';
        setTimeout(function () { label.textContent = old; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        done();
      }
    });
  });
})();
