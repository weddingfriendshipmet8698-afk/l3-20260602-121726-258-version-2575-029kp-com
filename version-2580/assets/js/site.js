(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  var hlsLoader = null;

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    if (hlsLoader) {
      hlsLoader.addEventListener('load', callback, { once: true });
      return;
    }

    hlsLoader = document.createElement('script');
    hlsLoader.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
    hlsLoader.async = true;
    hlsLoader.addEventListener('load', callback, { once: true });
    document.head.appendChild(hlsLoader);
  }

  function activeUrl(container) {
    var active = container.parentElement.querySelector('.source-tab.active');
    return active ? active.getAttribute('data-video-url') : '';
  }

  function prepareVideo(video, url, done) {
    if (!url || !video) {
      return;
    }

    if (video.hlsInstance) {
      video.hlsInstance.destroy();
      video.hlsInstance = null;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      done();
      return;
    }

    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        video.hlsInstance = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, done);
      } else {
        video.src = url;
        done();
      }
    });
  }

  players.forEach(function (container) {
    var video = container.querySelector('[data-video-target]');
    var playButton = container.querySelector('[data-play-button]');
    var tabs = Array.prototype.slice.call(container.parentElement.querySelectorAll('.source-tab'));

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (item) {
          item.classList.remove('active');
        });
        tab.classList.add('active');

        if (video) {
          video.pause();
          video.removeAttribute('src');
          video.load();
        }

        if (playButton) {
          playButton.classList.remove('is-hidden');
        }
      });
    });

    function play() {
      var url = activeUrl(container);
      prepareVideo(video, url, function () {
        if (playButton) {
          playButton.classList.add('is-hidden');
        }

        var playTask = video.play();

        if (playTask && playTask.catch) {
          playTask.catch(function () {
            if (playButton) {
              playButton.classList.remove('is-hidden');
            }
          });
        }
      });
    }

    if (playButton) {
      playButton.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }
  });

  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var results = document.querySelector('[data-search-results]');
  var title = document.querySelector('[data-search-title]');

  if (form && input && results && window.SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var incoming = params.get('q') || '';

    if (incoming) {
      input.value = incoming;
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card">' +
        '<a class="poster-wrap" href="' + movie.url + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'image-hide\')">' +
        '<span class="poster-shade"></span><span class="play-dot">▶</span></a>' +
        '<div class="movie-card-body"><div class="meta-line">' +
        '<span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
        '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.summary) + '</p><div class="tag-row">' + tags + '</div></div></article>';
    }

    function runSearch() {
      var keyword = input.value.trim().toLowerCase();
      var category = categoryFilter ? categoryFilter.value : '';
      var list = window.SEARCH_INDEX.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.summary,
          movie.categoryName,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();

        var keywordMatch = !keyword || haystack.indexOf(keyword) > -1;
        var categoryMatch = !category || movie.category === category;
        return keywordMatch && categoryMatch;
      }).slice(0, 96);

      results.innerHTML = list.map(card).join('');

      if (title) {
        title.textContent = keyword || category ? '匹配结果' : '热门内容';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch();
    });

    input.addEventListener('input', runSearch);

    if (categoryFilter) {
      categoryFilter.addEventListener('change', runSearch);
    }

    if (incoming) {
      runSearch();
    }
  }
})();
