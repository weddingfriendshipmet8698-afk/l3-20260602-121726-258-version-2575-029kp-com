(function () {
  function setStatus(shell, message) {
    var status = shell.querySelector('[data-player-status]');
    if (status) {
      status.textContent = message;
    }
  }

  function initializePlayer(shell) {
    var video = shell.querySelector('video');
    var src = shell.getAttribute('data-video-src');

    if (!video || !src) {
      setStatus(shell, '未找到播放源');
      return;
    }

    if (shell.getAttribute('data-ready') === 'true') {
      video.play();
      shell.classList.add('is-playing');
      return;
    }

    setStatus(shell, '正在加载播放源');

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        shell.setAttribute('data-ready', 'true');
        setStatus(shell, '播放源加载完成');
        video.play();
        shell.classList.add('is-playing');
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus(shell, '视频加载失败，请稍后重试');
        }
      });
      shell._hls = hls;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', function () {
        shell.setAttribute('data-ready', 'true');
        setStatus(shell, '播放源加载完成');
        video.play();
        shell.classList.add('is-playing');
      }, { once: true });
      video.load();
      return;
    }

    setStatus(shell, '当前浏览器不支持 HLS 播放');
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var button = shell.querySelector('[data-play-button]');
    var video = shell.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        initializePlayer(shell);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          shell.classList.remove('is-playing');
        }
      });
    }
  });
})();
