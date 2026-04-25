(function () {
  var grid = document.getElementById("bookmark-grid");
  var dataEl = document.getElementById("bookmarks-data");
  if (!grid || !dataEl) return;

  var BOOKMARKS;
  try {
    BOOKMARKS = JSON.parse(dataEl.textContent);
  } catch (e) {
    return;
  }
  if (!Array.isArray(BOOKMARKS)) return;

  function tileIcon(entry) {
    if (entry.icon && String(entry.icon).trim()) return String(entry.icon).trim();
    return (entry.label || "?").trim().charAt(0).toUpperCase();
  }

  BOOKMARKS.forEach(function (entry) {
    if (!entry || !entry.url) return;
    var a = document.createElement("a");
    a.className = "bookmark-link";
    a.href = entry.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    var icon = document.createElement("span");
    icon.className = "bookmark-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = tileIcon(entry);

    var label = document.createElement("span");
    label.className = "bookmark-label";
    label.textContent = entry.label || entry.url;

    a.appendChild(icon);
    a.appendChild(label);
    grid.appendChild(a);
  });
})();
