(function () {
  const DISPLAY_NAME = "Rand";

  const el = document.getElementById("greeting-line");
  if (!el) return;

  function phrase(hour) {
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  function render() {
    const hour = new Date().getHours();
    el.textContent = phrase(hour) + ", " + DISPLAY_NAME;
  }

  render();
  setInterval(render, 60 * 1000);
})();
