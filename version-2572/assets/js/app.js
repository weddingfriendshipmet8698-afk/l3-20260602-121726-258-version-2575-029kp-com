const menuButton = document.getElementById("menuButton");
const siteNav = document.getElementById("siteNav");

if (menuButton && siteNav) {
  menuButton.addEventListener("click", () => {
    siteNav.classList.toggle("is-open");
  });
}

const hero = document.getElementById("heroCarousel");

if (hero) {
  const slides = Array.from(hero.querySelectorAll(".hero-slide"));
  const dots = Array.from(hero.querySelectorAll(".hero-dot"));
  const next = hero.querySelector(".hero-next");
  const prev = hero.querySelector(".hero-prev");
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, current) => {
      slide.classList.toggle("is-active", current === index);
    });
    dots.forEach((dot, current) => {
      dot.classList.toggle("is-active", current === index);
    });
  };

  const play = () => {
    timer = window.setInterval(() => show(index + 1), 5000);
  };

  const restart = () => {
    window.clearInterval(timer);
    play();
  };

  if (next) {
    next.addEventListener("click", () => {
      show(index + 1);
      restart();
    });
  }

  if (prev) {
    prev.addEventListener("click", () => {
      show(index - 1);
      restart();
    });
  }

  dots.forEach((dot, current) => {
    dot.addEventListener("click", () => {
      show(current);
      restart();
    });
  });

  play();
}

const pageSearch = document.getElementById("pageSearch");
const typeFilter = document.getElementById("typeFilter");
const yearFilter = document.getElementById("yearFilter");
const cards = Array.from(document.querySelectorAll("[data-search-card]"));

const getQuery = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("q") || "";
};

if (pageSearch && getQuery()) {
  pageSearch.value = getQuery();
}

const applyFilters = () => {
  const query = pageSearch ? pageSearch.value.trim().toLowerCase() : "";
  const type = typeFilter ? typeFilter.value : "";
  const year = yearFilter ? yearFilter.value : "";

  cards.forEach((card) => {
    const text = [
      card.dataset.title,
      card.dataset.genre,
      card.dataset.category,
      card.dataset.year,
      card.dataset.type
    ].join(" ").toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesType = !type || (card.dataset.type || "").includes(type);
    const matchesYear = !year || card.dataset.year === year;
    card.classList.toggle("is-filter-hidden", !(matchesQuery && matchesType && matchesYear));
  });
};

[pageSearch, typeFilter, yearFilter].forEach((control) => {
  if (control) {
    control.addEventListener("input", applyFilters);
    control.addEventListener("change", applyFilters);
  }
});

if (cards.length) {
  applyFilters();
}
