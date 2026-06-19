(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function createResult(movie) {
    var link = document.createElement("a");
    link.className = "search-result-item";
    link.href = movie.url;

    var image = document.createElement("img");
    image.src = movie.cover;
    image.alt = movie.title;
    image.loading = "lazy";
    image.onerror = function () {
      image.style.display = "none";
    };

    var box = document.createElement("div");
    var title = document.createElement("h3");
    title.textContent = movie.title;
    var meta = document.createElement("p");
    meta.textContent = [movie.year, movie.region, movie.type, movie.genre].filter(Boolean).join(" · ");
    var summary = document.createElement("p");
    summary.textContent = movie.summary || "";

    box.appendChild(title);
    box.appendChild(meta);
    box.appendChild(summary);
    link.appendChild(image);
    link.appendChild(box);
    return link;
  }

  ready(function () {
    var menuToggle = document.querySelector(".menu-toggle");
    var mobileNav = document.getElementById("mobileNav");
    var searchPanel = document.getElementById("searchPanel");
    var searchInput = document.getElementById("siteSearchInput");
    var searchResults = document.getElementById("siteSearchResults");
    var movies = window.SITE_MOVIES || [];

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
        menuToggle.textContent = open ? "×" : "☰";
      });
    }

    function renderSearch(query) {
      if (!searchResults) {
        return;
      }
      var q = text(query).trim();
      searchResults.innerHTML = "";
      if (!q) {
        var hint = document.createElement("p");
        hint.textContent = "输入关键词即可查看匹配影片";
        searchResults.appendChild(hint);
        return;
      }
      var matched = movies.filter(function (movie) {
        var bag = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.summary].join(" ");
        return text(bag).indexOf(q) !== -1;
      }).slice(0, 24);
      if (!matched.length) {
        var empty = document.createElement("p");
        empty.textContent = "没有找到匹配影片";
        searchResults.appendChild(empty);
        return;
      }
      matched.forEach(function (movie) {
        searchResults.appendChild(createResult(movie));
      });
    }

    function openSearch(value) {
      if (!searchPanel || !searchInput) {
        return;
      }
      searchPanel.classList.add("is-open");
      searchPanel.setAttribute("aria-hidden", "false");
      searchInput.value = value || searchInput.value || "";
      searchInput.focus();
      renderSearch(searchInput.value);
    }

    function closeSearch() {
      if (!searchPanel) {
        return;
      }
      searchPanel.classList.remove("is-open");
      searchPanel.setAttribute("aria-hidden", "true");
    }

    document.querySelectorAll(".js-open-search").forEach(function (button) {
      button.addEventListener("click", function () {
        openSearch("");
      });
    });

    document.querySelectorAll(".js-close-search").forEach(function (button) {
      button.addEventListener("click", closeSearch);
    });

    if (searchPanel) {
      searchPanel.addEventListener("click", function (event) {
        if (event.target === searchPanel) {
          closeSearch();
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        renderSearch(searchInput.value);
      });
    }

    document.querySelectorAll("[data-global-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[type='search']");
        openSearch(input ? input.value : "");
      });
    });

    document.querySelectorAll("[data-filter-section]").forEach(function (section) {
      var input = section.querySelector("[data-filter-input]");
      var selects = Array.prototype.slice.call(section.querySelectorAll("[data-filter-field]"));
      var cards = Array.prototype.slice.call(section.parentElement.querySelectorAll("[data-movie-card]"));

      function apply() {
        var q = input ? text(input.value).trim() : "";
        var conditions = selects.map(function (select) {
          return {
            field: select.getAttribute("data-filter-field"),
            value: select.value
          };
        });

        cards.forEach(function (card) {
          var haystack = [card.getAttribute("data-title"), card.getAttribute("data-region"), card.getAttribute("data-type"), card.getAttribute("data-year"), card.getAttribute("data-genre")].join(" ");
          var ok = !q || text(haystack).indexOf(q) !== -1;
          conditions.forEach(function (condition) {
            if (condition.value && card.getAttribute("data-" + condition.field) !== condition.value) {
              ok = false;
            }
          });
          card.style.display = ok ? "" : "none";
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function startHero() {
      if (slides.length < 2) {
        return;
      }
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    document.querySelectorAll(".hero-next").forEach(function (button) {
      button.addEventListener("click", function () {
        showSlide(current + 1);
        startHero();
      });
    });

    document.querySelectorAll(".hero-prev").forEach(function (button) {
      button.addEventListener("click", function () {
        showSlide(current - 1);
        startHero();
      });
    });

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startHero();
      });
    });

    showSlide(0);
    startHero();

    document.querySelectorAll(".back-top").forEach(function (button) {
      button.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeSearch();
      }
    });
  });
})();
