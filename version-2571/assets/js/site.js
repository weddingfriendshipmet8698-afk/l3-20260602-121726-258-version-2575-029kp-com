(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    initMenu();
    initHero();
    initScrollers();
    initCardFilters();
    initGlobalSearch();
  });

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
  }

  function initScrollers() {
    document.querySelectorAll("[data-scroll-left]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-scroll-left"));
        if (target) {
          target.scrollBy({ left: -420, behavior: "smooth" });
        }
      });
    });

    document.querySelectorAll("[data-scroll-right]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-scroll-right"));
        if (target) {
          target.scrollBy({ left: 420, behavior: "smooth" });
        }
      });
    });
  }

  function initCardFilters() {
    var containers = Array.prototype.slice.call(document.querySelectorAll("[data-card-container]"));
    if (!containers.length) {
      return;
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var activeCategory = "all";

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        activeCategory = chip.getAttribute("data-filter-chip") || "all";
        applyFilters();
      });
    });

    searchInputs.forEach(function (input) {
      input.addEventListener("input", applyFilters);
    });

    selects.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });

    function applyFilters() {
      var keyword = normalize(searchInputs.map(function (input) {
        return input.value;
      }).join(" "));
      var year = getSelectValue("year");
      var type = getSelectValue("type");
      var visible = 0;

      containers.forEach(function (container) {
        var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year")
          ].join(" "));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesCategory = activeCategory === "all" || card.getAttribute("data-category") === activeCategory;
          var matchesYear = year === "all" || card.getAttribute("data-year") === year;
          var matchesType = type === "all" || card.getAttribute("data-type") === type;
          var show = matchesKeyword && matchesCategory && matchesYear && matchesType;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
      });

      document.querySelectorAll("[data-empty-state]").forEach(function (state) {
        state.hidden = visible !== 0;
      });
    }

    function getSelectValue(name) {
      var select = document.querySelector('[data-filter-select="' + name + '"]');
      return select ? select.value : "all";
    }
  }

  function initGlobalSearch() {
    var input = document.querySelector("[data-global-search]");
    var results = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");
    var recommend = document.querySelector("[data-search-recommend]");
    var form = document.querySelector("[data-global-search-form]");
    if (!input || !results || !window.SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;
    render(initialQuery);

    input.addEventListener("input", function () {
      render(input.value);
    });

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render(input.value);
        var query = input.value.trim();
        var nextUrl = query ? "?q=" + encodeURIComponent(query) : window.location.pathname;
        window.history.replaceState({}, "", nextUrl);
      });
    }

    function render(query) {
      var value = normalize(query);
      if (!value) {
        results.hidden = true;
        results.innerHTML = "";
        if (empty) {
          empty.hidden = true;
        }
        if (recommend) {
          recommend.hidden = false;
        }
        return;
      }

      var matches = window.SEARCH_DATA.filter(function (item) {
        return normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.tags,
          item.oneLine
        ].join(" ")).indexOf(value) !== -1;
      }).slice(0, 80);

      results.innerHTML = matches.map(renderCard).join("");
      results.hidden = matches.length === 0;
      if (empty) {
        empty.hidden = matches.length !== 0;
      }
      if (recommend) {
        recommend.hidden = matches.length !== 0;
      }
    }

    function renderCard(item) {
      return [
        '<article class="movie-card">',
        '  <a href="./' + escapeHtml(item.url) + '" class="movie-cover" aria-label="' + escapeHtml(item.title) + '">',
        '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="play-chip">播放</span>',
        '  </a>',
        '  <div class="movie-info">',
        '    <div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
        '    <h2><a href="./' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="tag-row"><span>' + escapeHtml(item.type) + '</span></div>',
        '  </div>',
        '</article>'
      ].join("");
    }

    function escapeHtml(value) {
      return (value || "").toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  }
})();
