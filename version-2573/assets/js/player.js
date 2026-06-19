(function () {
    function initPlayer() {
        var shell = document.querySelector('[data-player]');
        if (!shell) {
            return;
        }

        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');
        if (!video || !button) {
            return;
        }

        var source = video.getAttribute('data-video-url');
        var hls = null;
        var prepared = false;

        function prepareVideo() {
            if (prepared || !source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            }

            prepared = true;
        }

        function startPlayback() {
            prepareVideo();
            button.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', startPlayback);
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', initPlayer);
}());
