(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-overlay");
      var stream = player.getAttribute("data-stream");
      var hlsInstance = null;
      var initialized = false;

      if (!video || !stream) {
        return;
      }

      function initialize() {
        if (initialized) {
          return;
        }
        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function startPlayback() {
        initialize();
        player.classList.add("is-ready");
        var playRequest = video.play();
        if (playRequest && typeof playRequest.then === "function") {
          playRequest.then(function () {
            player.classList.add("is-playing");
          }).catch(function () {
            player.classList.remove("is-playing");
          });
        } else {
          player.classList.add("is-playing");
        }
      }

      if (button) {
        button.addEventListener("click", startPlayback);
      }

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
      });

      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });

      initialize();
    });
  });
})();
