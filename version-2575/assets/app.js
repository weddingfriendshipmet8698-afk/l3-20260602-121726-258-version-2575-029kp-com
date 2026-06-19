(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-thumb]"));
    var current = 0;
    var timer = null;

    if (!slides.length || !thumbs.length) {
      return;
    }

    function show(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle("is-active", thumbIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show((current + 1) % slides.length);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var index = Number(thumb.getAttribute("data-hero-thumb"));
        stop();
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function setupCardFilters() {
    var bars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));

    bars.forEach(function (bar) {
      var searchInput = bar.querySelector("[data-card-search]");
      var yearSelect = bar.querySelector("[data-card-year]");
      var typeSelect = bar.querySelector("[data-card-type]");
      var resetButton = bar.querySelector("[data-card-reset]");
      var list = document.querySelector("[data-card-list]");
      var empty = document.querySelector("[data-empty-state]");

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

      function apply() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var visibleCount = 0;

        cards.forEach(function (card) {
          var searchText = card.getAttribute("data-search") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matched = true;

          if (keyword && searchText.indexOf(keyword) === -1) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }

          card.hidden = !matched;
          if (matched) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.hidden = visibleCount !== 0;
        }
      }

      [searchInput, yearSelect, typeSelect].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });

      if (resetButton) {
        resetButton.addEventListener("click", function () {
          if (searchInput) {
            searchInput.value = "";
          }
          if (yearSelect) {
            yearSelect.value = "";
          }
          if (typeSelect) {
            typeSelect.value = "";
          }
          apply();
        });
      }
    });
  }

  function movieCardTemplate(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3).join(" / ") : "精选剧集";

    return [
      '<article class="movie-card">',
      '  <a class="card-link" href="' + escapeAttribute(movie.href) + '">',
      '    <figure class="card-cover">',
      '      <img src="' + escapeAttribute(movie.image) + '" alt="' + escapeAttribute(movie.title) + '" loading="lazy">',
      '      <figcaption>' + escapeHtml(movie.duration || "高清") + '</figcaption>',
      '    </figure>',
      '    <div class="card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine || movie.summary || "") + '</p>',
      '      <div class="card-meta">',
      '        <span>' + escapeHtml(movie.category || "精选") + '</span>',
      '        <span>' + escapeHtml(movie.year || "") + '</span>',
      '      </div>',
      '      <div class="card-tags">' + escapeHtml(tags) + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function setupSearchPage() {
    var input = document.getElementById("global-search");
    var category = document.getElementById("global-category");
    var button = document.getElementById("global-search-button");
    var results = document.getElementById("search-results");
    var count = document.getElementById("search-count");

    if (!input || !results || !Array.isArray(window.MOVIE_SEARCH_INDEX)) {
      return;
    }

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var categoryName = category ? category.value : "";
      var matches = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          movie.summary,
          movie.category,
          Array.isArray(movie.tags) ? movie.tags.join(" ") : ""
        ].join(" ").toLowerCase();

        if (categoryName && movie.category !== categoryName) {
          return false;
        }
        return !keyword || haystack.indexOf(keyword) !== -1;
      });

      var visible = matches.slice(0, 120);
      results.innerHTML = visible.map(movieCardTemplate).join("");

      if (count) {
        if (!keyword && !categoryName) {
          count.textContent = "默认展示片库前 120 条内容，可输入关键词继续筛选。";
        } else {
          count.textContent = "找到 " + matches.length + " 条匹配内容，当前显示前 " + visible.length + " 条。";
        }
      }
    }

    input.addEventListener("input", render);
    if (category) {
      category.addEventListener("change", render);
    }
    if (button) {
      button.addEventListener("click", render);
    }
    render();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var source = player.getAttribute("data-video-src");
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var message = player.querySelector("[data-player-message]");
      var hlsInstance = null;
      var initialized = false;

      if (!source || !video || !button) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text;
        }
      }

      function startPlayback() {
        button.classList.add("is-hidden");

        if (!initialized) {
          initialized = true;

          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {
                setMessage("播放源已载入，请点击播放器继续播放。");
              });
            });
            hlsInstance.on(window.Hls.Events.ERROR, function () {
              setMessage("线路连接中，如未自动播放请再次点击播放器。");
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", function () {
              video.play().catch(function () {
                setMessage("播放源已载入，请点击播放器继续播放。");
              });
            }, { once: true });
          } else {
            video.src = source;
            video.play().catch(function () {
              setMessage("当前浏览器未加载 HLS 组件，可更换支持 HLS 的浏览器播放。");
            });
          }
        } else {
          video.play().catch(function () {
            setMessage("播放源已载入，请点击播放器继续播放。");
          });
        }
      }

      button.addEventListener("click", startPlayback);
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          button.classList.remove("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupCardFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
