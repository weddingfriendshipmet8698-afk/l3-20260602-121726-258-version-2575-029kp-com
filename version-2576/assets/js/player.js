(function () {
  function connect(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');
    var status = shell.querySelector('.player-status');
    var source = shell.getAttribute('data-video');
    var started = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function start() {
      if (!video || !source) {
        setStatus('播放源暂不可用');
        return;
      }
      if (!started) {
        started = true;
        setStatus('正在连接');
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function () {
            setStatus('播放遇到问题，请稍后重试');
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }
      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
          setStatus('点击按钮开始播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.video-shell')).forEach(connect);
})();
