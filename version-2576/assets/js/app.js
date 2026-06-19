(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.main-nav');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var active = 0;

  function setHero(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === active);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      setHero(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setHero(active + 1);
    }, 5200);
  }

  var grids = Array.prototype.slice.call(document.querySelectorAll('[data-sort-grid]'));
  grids.forEach(function (grid) {
    var section = grid.closest('.section-block') || document;
    var input = section.querySelector('[data-filter-input]');
    var year = section.querySelector('[data-filter-year]');
    var sort = section.querySelector('[data-sort-select]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      cards.forEach(function (card) {
        var haystack = (card.textContent || '').toLowerCase();
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        card.style.display = okKeyword && okYear ? '' : 'none';
      });
      if (sort) {
        var ordered = cards.slice().sort(function (a, b) {
          var mode = sort.value;
          var ay = Number(a.getAttribute('data-year') || 0);
          var by = Number(b.getAttribute('data-year') || 0);
          var at = a.getAttribute('data-title') || '';
          var bt = b.getAttribute('data-title') || '';
          if (mode === 'year-asc') {
            return ay - by || at.localeCompare(bt, 'zh-Hans-CN');
          }
          if (mode === 'title-asc') {
            return at.localeCompare(bt, 'zh-Hans-CN');
          }
          return by - ay || at.localeCompare(bt, 'zh-Hans-CN');
        });
        ordered.forEach(function (card) {
          grid.appendChild(card);
        });
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    if (sort) {
      sort.addEventListener('change', apply);
    }
  });
})();
