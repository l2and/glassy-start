(function () {
  const timeEl = document.getElementById("clock-time");
  const dateEl = document.getElementById("clock-date");
  const tempEl = document.getElementById("weather-temp");
  const wordEl = document.getElementById("weather-word");
  const iconEl = document.getElementById("weather-icon");
  const fallbackEl = document.getElementById("weather-icon-fallback");
  const locationEl = document.getElementById("weather-location");
  if (!timeEl || !dateEl || !tempEl || !wordEl || !iconEl || !fallbackEl) return;

  const ICON_BASE = "../../assets/weather-icons";
  const WEATHER_REFRESH_MS = 15 * 60 * 1000;

  const geoByKey = Object.create(null);

  const FALLBACK_EMOJI = {
    clear: "☀️",
    "partly-cloudy": "⛅",
    cloudy: "☁️",
    fog: "🌫️",
    drizzle: "🌦️",
    rain: "🌧️",
    snow: "❄️",
    storm: "⛈️",
  };

  /** WMO weather code → { theme, word } (Open-Meteo current.weather_code) */
  function weatherFromCode(code) {
    const c = code | 0;
    if (c === 0) return { theme: "clear", word: "Clear" };
    if (c === 1) return { theme: "clear", word: "Fair" };
    if (c === 2) return { theme: "partly-cloudy", word: "Partly" };
    if (c === 3) return { theme: "cloudy", word: "Overcast" };
    if (c === 45 || c === 48) return { theme: "fog", word: "Foggy" };
    if (c >= 51 && c <= 57) return { theme: "drizzle", word: "Drizzle" };
    if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return { theme: "rain", word: "Rainy" };
    if ((c >= 71 && c <= 77) || c === 85 || c === 86) return { theme: "snow", word: "Snowy" };
    if (c >= 95 && c <= 99) return { theme: "storm", word: "Stormy" };
    return { theme: "partly-cloudy", word: "Weather" };
  }

  function ordinal(n) {
    const j = n % 10;
    const k = n % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  }

  function formatDateStamp(date) {
    const weekday = new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(date);
    const month = new Intl.DateTimeFormat(undefined, { month: "long" }).format(date);
    const day = date.getDate();
    const year = date.getFullYear();
    return `${weekday}, ${month} ${day}${ordinal(day)}, ${year}`;
  }

  const timeFmt = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  function tickClock() {
    const now = new Date();
    timeEl.textContent = timeFmt.format(now);
    timeEl.setAttribute("datetime", now.toISOString());
    dateEl.textContent = formatDateStamp(now);
  }

  function readCoords() {
    const params = new URLSearchParams(window.location.search);
    const lat = parseFloat(params.get("lat") || "");
    const lon = parseFloat(params.get("lon") || "");
    if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
    return { lat: 33.1455, lon: 117.0041 };
  }

  /** BigDataCloud reverse-geocode-client — no API key (browser CORS). */
  function formatCityState(d) {
    if (!d || typeof d !== "object") return "";
    const cityPart = String(d.locality || d.city || d.village || d.town || "").trim();
    let st = "";
    if (d.principalSubdivisionCode && typeof d.principalSubdivisionCode === "string") {
      const parts = d.principalSubdivisionCode.split("-");
      st = String(parts[parts.length - 1] || "").trim();
    }
    if (!st && d.principalSubdivision) st = String(d.principalSubdivision).trim();
    if (cityPart && st) return cityPart + ", " + st;
    if (cityPart) return cityPart;
    return st;
  }

  async function fetchCityState(lat, lon) {
    const key = lat.toFixed(4) + "," + lon.toFixed(4);
    if (Object.prototype.hasOwnProperty.call(geoByKey, key)) return geoByKey[key];
    const url =
      "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" +
      encodeURIComponent(String(lat)) +
      "&longitude=" +
      encodeURIComponent(String(lon)) +
      "&localityLanguage=en";
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const label = formatCityState(data);
      geoByKey[key] = label;
      return label;
    } catch {
      return "";
    }
  }

  function readImageOptions() {
    if (typeof window.GLASSY_IMAGE_OPTIONS !== "undefined" && window.GLASSY_IMAGE_OPTIONS) {
      return window.GLASSY_IMAGE_OPTIONS;
    }
    try {
      const p = window.parent;
      if (p && p !== window && p.GLASSY_IMAGE_OPTIONS) return p.GLASSY_IMAGE_OPTIONS;
    } catch (e) {
      /* cross-origin */
    }
    return null;
  }

  /** @returns {string|null} basename in folder, or null to use default icons */
  function getThemedWeatherFile(conditionFolder) {
    const opts = readImageOptions();
    const wi = opts && opts.weatherIcons;
    if (!wi || !wi.theme) return null;
    const def = wi.themes && wi.themes[wi.theme];
    if (!def || !def.files) return null;
    const name = def.files[conditionFolder];
    return typeof name === "string" && name.length > 0 ? name.trim() : null;
  }

  /** Weather art is PNG; append .png when config omits an extension */
  function asPngBasename(name) {
    if (!name) return null;
    if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(name)) return name;
    return name + ".png";
  }

  function setIcon(conditionFolder) {
    const base = `${ICON_BASE}/${conditionFolder}/`;
    iconEl.alt = wordEl.textContent || "Weather";

    function showFallback() {
      iconEl.removeAttribute("src");
      iconEl.style.visibility = "hidden";
      fallbackEl.textContent = FALLBACK_EMOJI[conditionFolder] || "🌤️";
      fallbackEl.hidden = false;
    }

    function onLoadOk() {
      iconEl.style.visibility = "visible";
      fallbackEl.hidden = true;
    }

    function tryDefaultSvg() {
      iconEl.onerror = showFallback;
      iconEl.onload = onLoadOk;
      iconEl.src = base + "icon.svg";
    }

    function tryDefaultPng() {
      iconEl.onerror = tryDefaultSvg;
      iconEl.onload = onLoadOk;
      iconEl.src = base + "icon.png";
    }

    const themedRaw = getThemedWeatherFile(conditionFolder);
    const themedFile = themedRaw ? asPngBasename(themedRaw) : null;
    if (themedFile) {
      iconEl.onload = onLoadOk;
      iconEl.onerror = tryDefaultPng;
      iconEl.src = base + encodeURI(themedFile);
      return;
    }

    iconEl.onload = onLoadOk;
    iconEl.onerror = tryDefaultSvg;
    iconEl.src = base + "icon.png";
  }

  async function refreshWeather() {
    const { lat, lon } = readCoords();
    const geoPromise = fetchCityState(lat, lon);
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=" +
      encodeURIComponent(String(lat)) +
      "&longitude=" +
      encodeURIComponent(String(lon)) +
      "&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto";

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const cur = data.current;
      if (!cur) throw new Error("no current");
      const t = cur.temperature_2m;
      const code = cur.weather_code;
      const { theme, word } = weatherFromCode(code);
      tempEl.textContent = Math.round(t) + "°F";
      wordEl.textContent = word;
      setIcon(theme);
      if (locationEl) {
        const place = await geoPromise;
        locationEl.textContent = place || "";
      }
    } catch {
      tempEl.textContent = "--°F";
      wordEl.textContent = "Offline";
      setIcon("partly-cloudy");
      if (locationEl) {
        try {
          locationEl.textContent = (await geoPromise) || "";
        } catch {
          locationEl.textContent = "";
        }
      }
    }
  }

  tickClock();
  setInterval(tickClock, 1000);

  refreshWeather();
  setInterval(refreshWeather, WEATHER_REFRESH_MS);
})();
