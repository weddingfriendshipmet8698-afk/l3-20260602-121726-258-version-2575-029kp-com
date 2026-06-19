(function () {
  window.initMoviePlayer = function (src, poster) {
    var video = document.getElementById("movie-video");
    var overlay = document.getElementById("player-overlay");
    if (!video || !src) {
      return;
    }

    var attached = false;

    if (poster) {
      video.setAttribute("poster", poster);
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        return;
      }

      video.src = src;
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
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
  };
})();
