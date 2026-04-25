/**
 * glassy-start — loads card iframes into #card-grid.
 *
 * Which cards appear is controlled in `js/cards.config.js` (`enabled` per row).
 * If that script is missing or `window.GLASSY_CARDS` is invalid, built-in defaults
 * below are used.
 */
(function () {
  const DEFAULT_CARDS = [
    {
      id: "search",
      title: "Search",
      src: "cards/search/search.html",
      span: "wide",
    },
    {
      id: "greeting",
      title: "Greeting",
      src: "cards/greeting/greeting.html",
      span: "wide",
    },
    {
      id: "clock",
      title: "Clock",
      src: "cards/clock/clock.html",
      span: "narrow",
    },
    {
      id: "clock-weather",
      title: "Clock & weather",
      src: "cards/clock-weather/clock-weather.html",
      span: "narrow",
    },
    {
      id: "bookmarks",
      title: "Bookmarks",
      src: "cards/bookmarks/bookmarks.html",
      span: "full",
    },
  ];

  const raw = typeof window !== "undefined" ? window.GLASSY_CARDS : null;
  const CARDS = Array.isArray(raw)
    ? raw.filter(function (card) {
        return card && card.id && card.src && card.enabled !== false;
      })
    : DEFAULT_CARDS;

  const grid = document.getElementById("card-grid");
  if (!grid) return;

  const spanMap = {
    wide: "wide",
    narrow: "narrow",
    half: "half",
    full: "full",
  };

  CARDS.forEach(function (card) {
    const wrap = document.createElement("div");
    wrap.className = "glass-card";
    wrap.setAttribute("data-span", spanMap[card.span] || "half");
    wrap.setAttribute("data-card-id", card.id);

    const iframe = document.createElement("iframe");
    iframe.className = "card-iframe";
    iframe.title = card.title || card.id;
    iframe.loading = "lazy";
    iframe.setAttribute("referrerpolicy", "no-referrer");

    let src = card.src;
    if (card.id === "clock-weather") {
      const root = document.documentElement;
      const lat = root.dataset.latitude;
      const lon = root.dataset.longitude;
      if (lat && lon) {
        const q = new URLSearchParams({ lat, lon }).toString();
        src += (src.includes("?") ? "&" : "?") + q;
      }
    }
    iframe.src = src;

    wrap.appendChild(iframe);
    grid.appendChild(wrap);
  });
})();
