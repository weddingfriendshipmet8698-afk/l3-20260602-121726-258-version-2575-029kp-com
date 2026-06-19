(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".site-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initCarousel() {
        var carousel = document.querySelector("[data-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initFilters() {
        var list = document.querySelector(".searchable-list");
        if (!list) {
            return;
        }
        var input = document.querySelector(".search-input");
        var year = document.querySelector(".year-filter");
        var type = document.querySelector(".type-filter");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && input) {
            input.value = query;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        function apply() {
            var q = normalize(input && input.value);
            var y = normalize(year && year.value);
            var t = normalize(type && type.value);
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.region,
                    card.dataset.type,
                    card.textContent
                ].join(" "));
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (y && normalize(card.dataset.year) !== y) {
                    ok = false;
                }
                if (t && normalize(card.dataset.type) !== t) {
                    ok = false;
                }
                card.classList.toggle("is-filtered-out", !ok);
            });
        }
        [input, year, type].forEach(function (node) {
            if (node) {
                node.addEventListener("input", apply);
                node.addEventListener("change", apply);
            }
        });
        apply();
    }

    function loadHls() {
        return new Promise(function (resolve, reject) {
            if (window.Hls) {
                resolve(window.Hls);
                return;
            }
            var existing = document.querySelector("script[data-hls-loader]");
            if (existing) {
                existing.addEventListener("load", function () {
                    resolve(window.Hls);
                });
                existing.addEventListener("error", reject);
                return;
            }
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
            script.async = true;
            script.dataset.hlsLoader = "true";
            script.addEventListener("load", function () {
                resolve(window.Hls);
            });
            script.addEventListener("error", reject);
            document.head.appendChild(script);
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".player-wrap"));
        players.forEach(function (wrap) {
            var video = wrap.querySelector("video");
            var trigger = wrap.querySelector(".player-trigger");
            var state = wrap.querySelector(".player-state");
            if (!video || !trigger) {
                return;
            }
            var started = false;
            function setState(text) {
                if (state) {
                    state.textContent = text || "";
                }
            }
            function play() {
                var source = video.dataset.stream;
                if (!source || started) {
                    if (video.paused) {
                        video.play().catch(function () {});
                    }
                    return;
                }
                started = true;
                trigger.classList.add("is-hidden");
                setState("正在加载");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.play().then(function () {
                        setState("");
                    }).catch(function () {
                        setState("播放暂时无法加载");
                    });
                    return;
                }
                loadHls().then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        var hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        hls.on(Hls.Events.MANIFEST_PARSED, function () {
                            video.play().then(function () {
                                setState("");
                            }).catch(function () {
                                setState("点击视频继续播放");
                            });
                        });
                        hls.on(Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                setState("播放暂时无法加载");
                            }
                        });
                    } else {
                        video.src = source;
                        video.play().catch(function () {
                            setState("播放暂时无法加载");
                        });
                    }
                }).catch(function () {
                    video.src = source;
                    video.play().catch(function () {
                        setState("播放暂时无法加载");
                    });
                });
            }
            trigger.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initCarousel();
        initFilters();
        initPlayers();
    });
})();
