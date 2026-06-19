(function () {
  var box = document.getElementById('siteSearchInput');
  var year = document.getElementById('siteSearchYear');
  var sort = document.getElementById('siteSearchSort');
  var target = document.getElementById('searchResults');
  if (!box || !target || !Array.isArray(CATALOG_ENTRIES)) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  box.value = initial;

  function card(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card" data-year="' + item.year + '">' +
      '<a class="poster-link" href="' + item.href + '">' +
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="year-badge">' + item.year + '</span>' +
      '<span class="play-badge">▶</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<h3><a href="' + item.href + '">' + escapeHtml(item.title) + '</a></h3>' +
      '<p>' + escapeHtml(item.one) + '</p>' +
      '<div class="meta-line"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      })[char];
    });
  }

  function render() {
    var keyword = box.value.trim().toLowerCase();
    var selectedYear = year ? year.value : '';
    var items = CATALOG_ENTRIES.filter(function (item) {
      var haystack = [item.title, item.year, item.region, item.type, item.genre, item.category, (item.tags || []).join(' '), item.one].join(' ').toLowerCase();
      return (!keyword || haystack.indexOf(keyword) !== -1) && (!selectedYear || String(item.year) === selectedYear);
    });
    if (sort && sort.value === 'year') {
      items.sort(function (a, b) {
        return b.year - a.year || a.title.localeCompare(b.title, 'zh-Hans-CN');
      });
    } else if (sort && sort.value === 'title') {
      items.sort(function (a, b) {
        return a.title.localeCompare(b.title, 'zh-Hans-CN');
      });
    }
    target.innerHTML = items.slice(0, 240).map(card).join('') || '<div class="empty-result">没有找到匹配内容</div>';
  }

  box.addEventListener('input', render);
  if (year) {
    year.addEventListener('change', render);
  }
  if (sort) {
    sort.addEventListener('change', render);
  }
  render();
})();
