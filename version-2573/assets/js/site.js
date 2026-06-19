(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initHeaderSearch() {
        selectAll('[data-site-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var target = './search.html';
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function initMobileNavigation() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (!slides.length) {
            return;
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                schedule();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                schedule();
            });
        }

        schedule();
    }

    function collectYears(cards) {
        var years = cards.map(function (card) {
            return card.getAttribute('data-year');
        }).filter(Boolean);
        return Array.from(new Set(years)).sort(function (a, b) {
            return Number(b) - Number(a);
        });
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var grid = document.querySelector('[data-card-grid]');
        if (!panel || !grid) {
            return;
        }

        var cards = selectAll('[data-card]', grid);
        var input = panel.querySelector('[data-filter-input]');
        var yearFilter = panel.querySelector('[data-year-filter]');
        var sortFilter = panel.querySelector('[data-sort-filter]');
        var count = panel.querySelector('[data-result-count]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (input && query) {
            input.value = query;
        }

        if (yearFilter) {
            collectYears(cards).forEach(function (year) {
                var option = document.createElement('option');
                option.value = year;
                option.textContent = year + ' 年';
                yearFilter.appendChild(option);
            });
        }

        function sortCards() {
            if (!sortFilter || sortFilter.value === 'default') {
                return;
            }
            var sorted = cards.slice().sort(function (a, b) {
                if (sortFilter.value === 'year-desc') {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                }
                if (sortFilter.value === 'year-asc') {
                    return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
                }
                if (sortFilter.value === 'score-desc') {
                    return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
                }
                return 0;
            });
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var year = yearFilter ? yearFilter.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var search = normalize(card.getAttribute('data-search'));
                var cardYear = card.getAttribute('data-year') || '';
                var matched = (!keyword || search.indexOf(keyword) > -1) && (!year || cardYear === year);
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = String(visible);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilter);
        }
        if (sortFilter) {
            sortFilter.addEventListener('change', function () {
                sortCards();
                applyFilter();
            });
        }

        sortCards();
        applyFilter();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHeaderSearch();
        initMobileNavigation();
        initHero();
        initFilters();
    });
}());
