(function () {
  var form = document.getElementById("search-form");
  var combo = document.getElementById("search-combo");
  var input = document.getElementById("search-q");
  var trigger = document.getElementById("search-engine-trigger");
  var menu = document.getElementById("search-engine-menu");
  if (!form || !combo || !input || !trigger || !menu) return;

  var FALLBACK = {
    defaultEngine: "google",
    engines: [
      {
        id: "google",
        label: "Google",
        url: "https://www.google.com/search?q=%s",
      },
    ],
  };

  var raw = typeof window !== "undefined" ? window.GLASSY_SEARCH : null;
  var cfg =
    raw && typeof raw === "object" && Array.isArray(raw.engines) && raw.engines.length
      ? raw
      : FALLBACK;

  var engines = cfg.engines.filter(function (e) {
    return e && e.id && e.label && e.url && String(e.url).indexOf("%s") !== -1;
  });
  if (!engines.length) engines = FALLBACK.engines;

  var defaultId = cfg.defaultEngine || engines[0].id;
  var defaultEngine = null;
  for (var d = 0; d < engines.length; d++) {
    if (engines[d].id === defaultId) {
      defaultEngine = engines[d];
      break;
    }
  }
  if (!defaultEngine) defaultEngine = engines[0];

  var selectedId = defaultEngine.id;

  function engineById(id) {
    for (var i = 0; i < engines.length; i++) {
      if (engines[i].id === id) return engines[i];
    }
    return null;
  }

  function setPlaceholder() {
    var e = engineById(selectedId);
    input.placeholder = e ? String(e.label) : "";
  }

  function templateFor(id) {
    var e = engineById(id);
    return e ? String(e.url) : "";
  }

  function syncMenuSelection() {
    var opts = menu.querySelectorAll(".search-engine-option");
    for (var o = 0; o < opts.length; o++) {
      opts[o].setAttribute("aria-selected", opts[o].dataset.engineId === selectedId ? "true" : "false");
    }
  }

  engines.forEach(function (e) {
    var li = document.createElement("li");
    li.setAttribute("role", "none");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "search-engine-option";
    btn.setAttribute("role", "option");
    btn.dataset.engineId = e.id;
    btn.id = "search-engine-opt-" + e.id;
    btn.textContent = e.label;
    btn.addEventListener("click", function () {
      selectedId = e.id;
      setPlaceholder();
      syncMenuSelection();
      closeMenu();
      input.focus();
    });
    li.appendChild(btn);
    menu.appendChild(li);
  });

  setPlaceholder();
  syncMenuSelection();

  function isOpen() {
    return trigger.getAttribute("aria-expanded") === "true";
  }

  function openMenu() {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    if (isOpen()) closeMenu();
    else openMenu();
  }

  trigger.addEventListener("click", function (ev) {
    ev.stopPropagation();
    toggleMenu();
  });

  document.addEventListener(
    "mousedown",
    function (ev) {
      if (!isOpen()) return;
      var t = ev.target;
      if (trigger.contains(t) || menu.contains(t)) return;
      closeMenu();
    },
    true
  );

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && isOpen()) {
      closeMenu();
      trigger.focus();
    }
  });

  function buildSearchUrl(template, query) {
    var trimmed = String(query).trim();
    if (!trimmed) return null;
    if (String(template).indexOf("%s") === -1) return null;
    var encoded = encodeURIComponent(trimmed);
    return String(template).split("%s").join(encoded);
  }

  function isSafeHttpUrl(href) {
    try {
      var u = new URL(href);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch (err) {
      return false;
    }
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (isOpen()) closeMenu();
    var template = templateFor(selectedId);
    var href = buildSearchUrl(template, input.value);
    if (!href || !isSafeHttpUrl(href)) return;
    var topWin = window.top || window;
    topWin.location.assign(href);
  });
})();
