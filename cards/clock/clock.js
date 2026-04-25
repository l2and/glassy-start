(function () {
  const timeEl = document.getElementById("clock-time");
  const dateEl = document.getElementById("clock-date");
  if (!timeEl || !dateEl) return;

  const timeFmt = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateFmt = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  function tick() {
    const now = new Date();
    timeEl.textContent = timeFmt.format(now);
    timeEl.setAttribute("datetime", now.toISOString());
    dateEl.textContent = dateFmt.format(now);
  }

  tick();
  setInterval(tick, 1000);
})();
