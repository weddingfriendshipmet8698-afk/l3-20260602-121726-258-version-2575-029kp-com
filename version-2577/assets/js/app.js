(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (menuButton && nav) {
      menuButton.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }

      show(0);
      restart();
    });

    document.querySelectorAll(".movie-filter-form").forEach(function (form) {
      var scope = form.closest(".filter-scope") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var keyword = form.querySelector("[name='keyword']");
      var category = form.querySelector("[name='category']");
      var type = form.querySelector("[name='type']");
      var year = form.querySelector("[name='year']");

      function applyFilter() {
        var key = normalize(keyword && keyword.value);
        var cat = normalize(category && category.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.category,
            card.dataset.year,
            card.dataset.type,
            card.dataset.genre,
            card.textContent
          ].join(" "));
          var matched = true;

          if (key && haystack.indexOf(key) === -1) {
            matched = false;
          }
          if (cat && normalize(card.dataset.category) !== cat) {
            matched = false;
          }
          if (typeValue && normalize(card.dataset.type).indexOf(typeValue) === -1) {
            matched = false;
          }
          if (yearValue && normalize(card.dataset.year) !== yearValue) {
            matched = false;
          }

          card.classList.toggle("is-hidden-card", !matched);
        });
      }

      [keyword, category, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
    });
  });
})();

function initMoviePlayer(videoId, overlayId, sourceUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var loaded = false;
  var hls = null;

  if (!video || !sourceUrl) {
    return;
  }

  function attachSource() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function start() {
    attachSource();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove("is-hidden");
    }
  });
}
