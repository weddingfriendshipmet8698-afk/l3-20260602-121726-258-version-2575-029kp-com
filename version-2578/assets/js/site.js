(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-scroll-top]').forEach(function (button) {
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function setHero(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setHero(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        setHero((current + 1) % slides.length);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-filter-form]').forEach(function (form) {
    var scope = form.closest('section') || document;
    var parent = scope.parentElement || document;
    var grid = parent.querySelector('[data-filter-grid]') || document.querySelector('[data-filter-grid]');
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-card]')) : [];
    var input = form.querySelector('[data-filter-input]');
    var category = form.querySelector('[data-filter-category]');
    var sort = form.querySelector('[data-filter-sort]');
    var count = parent.querySelector('[data-filter-count]') || document.querySelector('[data-filter-count]');

    function textOf(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var query = (input && input.value ? input.value : '').trim().toLowerCase();
      var cat = category && category.value ? category.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matchQuery = !query || textOf(card).indexOf(query) !== -1;
        var matchCategory = !cat || card.getAttribute('data-category') === cat;
        var show = matchQuery && matchCategory;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 条内容';
      }
    }

    function applySort() {
      if (!grid || !sort) {
        return;
      }
      var mode = sort.value;
      var sorted = cards.slice();

      sorted.sort(function (a, b) {
        if (mode === 'year-desc') {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        }
        if (mode === 'year-asc') {
          return Number(a.getAttribute('data-year') || 0) - Number(b.getAttribute('data-year') || 0);
        }
        if (mode === 'title') {
          return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
        }
        return 0;
      });

      if (mode !== 'default') {
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      form.addEventListener(eventName, function () {
        applySort();
        applyFilter();
      });
    });

    form.addEventListener('reset', function () {
      window.setTimeout(function () {
        applySort();
        applyFilter();
      }, 0);
    });

    applyFilter();
  });
})();
