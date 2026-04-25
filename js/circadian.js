/**
 * Circadian background: solar dawn / day / golden hour / dusk / night using
 * local time and optional coordinates on <html data-latitude data-longitude>.
 *
 * Sun times: excerpt from SunCalc (MIT) — https://github.com/mourner/suncalc
 * (getTimes + dependencies only; moon/other exports omitted.)
 */
(function () {
  var PI = Math.PI,
    sin = Math.sin,
    cos = Math.cos,
    tan = Math.tan,
    asin = Math.asin,
    atan = Math.atan2,
    acos = Math.acos,
    rad = PI / 180;

  var dayMs = 1000 * 60 * 60 * 24,
    J1970 = 2440588,
    J2000 = 2451545;

  function toJulian(date) {
    return date.valueOf() / dayMs - 0.5 + J1970;
  }
  function fromJulian(j) {
    return new Date((j + 0.5 - J1970) * dayMs);
  }
  function toDays(date) {
    return toJulian(date) - J2000;
  }

  var e = rad * 23.4397;

  function rightAscension(l, b) {
    return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l));
  }
  function declination(l, b) {
    return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l));
  }

  function siderealTime(d, lw) {
    return rad * (280.16 + 360.9856235 * d) - lw;
  }

  function astroRefraction(h) {
    if (h < 0) h = 0;
    return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
  }

  function solarMeanAnomaly(d) {
    return rad * (357.5291 + 0.98560028 * d);
  }

  function eclipticLongitude(M) {
    var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)),
      P = rad * 102.9372;
    return M + C + P + PI;
  }

  function sunCoords(d) {
    var M = solarMeanAnomaly(d),
      L = eclipticLongitude(M);
    return { dec: declination(L, 0), ra: rightAscension(L, 0) };
  }

  var times = [
    [-0.833, "sunrise", "sunset"],
    [-6, "dawn", "dusk"],
    [6, "goldenHourEnd", "goldenHour"],
  ];

  var J0 = 0.0009;

  function julianCycle(d, lw) {
    return Math.round(d - J0 - lw / (2 * PI));
  }
  function approxTransit(Ht, lw, n) {
    return J0 + (Ht + lw) / (2 * PI) + n;
  }
  function solarTransitJ(ds, M, L) {
    return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L);
  }

  function hourAngle(h, phi, d) {
    return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d)));
  }
  function observerAngle(height) {
    return (-2.076 * Math.sqrt(height || 0)) / 60;
  }

  function getSetJ(h, lw, phi, dec, n, M, L) {
    var w = hourAngle(h, phi, dec),
      a = approxTransit(w, lw, n);
    return solarTransitJ(a, M, L);
  }

  function getTimes(date, lat, lng, height) {
    height = height || 0;
    var lw = rad * -lng,
      phi = rad * lat,
      dh = observerAngle(height),
      d = toDays(date),
      n = julianCycle(d, lw),
      ds = approxTransit(0, lw, n),
      M = solarMeanAnomaly(ds),
      L = eclipticLongitude(M),
      dec = declination(L, 0),
      Jnoon = solarTransitJ(ds, M, L),
      result = { solarNoon: fromJulian(Jnoon), nadir: fromJulian(Jnoon - 0.5) };

    for (var i = 0; i < times.length; i++) {
      var time = times[i],
        h0 = (time[0] + dh) * rad,
        Jset = getSetJ(h0, lw, phi, dec, n, M, L),
        Jrise = Jnoon - (Jset - Jnoon);
      result[time[1]] = fromJulian(Jrise);
      result[time[2]] = fromJulian(Jset);
    }
    return result;
  }

  function valid(d) {
    return d instanceof Date && !isNaN(d.getTime());
  }

  function readCoords() {
    var el = document.documentElement;
    var lat = parseFloat(el.getAttribute("data-latitude") || "40.7128");
    var lng = parseFloat(el.getAttribute("data-longitude") || "-74.0060");
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      lat = 40.7128;
      lng = -74.006;
    }
    return { lat: lat, lng: lng };
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smoothstep(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }

  /** RGB palettes — more saturated so glass has color to blur against */
  var PAL = {
    night: {
      gradA: { r: 8, g: 14, b: 42 },
      gradB: { r: 28, g: 12, b: 58 },
      m1: { r: 55, g: 85, b: 200 },
      m2: { r: 110, g: 35, b: 170 },
      m3: { r: 15, g: 95, b: 125 },
      meshStrength: 0.62,
    },
    dawn: {
      gradA: { r: 45, g: 28, b: 72 },
      gradB: { r: 95, g: 42, b: 95 },
      m1: { r: 255, g: 130, b: 115 },
      m2: { r: 200, g: 85, b: 210 },
      m3: { r: 95, g: 165, b: 245 },
      meshStrength: 0.68,
    },
    day: {
      gradA: { r: 12, g: 52, b: 88 },
      gradB: { r: 18, g: 95, b: 115 },
      m1: { r: 45, g: 195, b: 220 },
      m2: { r: 95, g: 145, b: 255 },
      m3: { r: 30, g: 210, b: 165 },
      meshStrength: 0.7,
    },
    golden: {
      gradA: { r: 85, g: 38, b: 28 },
      gradB: { r: 135, g: 55, b: 42 },
      m1: { r: 255, g: 195, b: 85 },
      m2: { r: 255, g: 115, b: 65 },
      m3: { r: 235, g: 75, b: 150 },
      meshStrength: 0.72,
    },
    dusk: {
      gradA: { r: 38, g: 22, b: 78 },
      gradB: { r: 28, g: 32, b: 105 },
      m1: { r: 195, g: 70, b: 210 },
      m2: { r: 85, g: 65, b: 225 },
      m3: { r: 55, g: 130, b: 220 },
      meshStrength: 0.66,
    },
  };

  function mixPal(a, b, t) {
    t = smoothstep(t);
    function mc(x, y) {
      return {
        r: Math.round(lerp(x.r, y.r, t)),
        g: Math.round(lerp(x.g, y.g, t)),
        b: Math.round(lerp(x.b, y.b, t)),
      };
    }
    return {
      gradA: mc(a.gradA, b.gradA),
      gradB: mc(a.gradB, b.gradB),
      m1: mc(a.m1, b.m1),
      m2: mc(a.m2, b.m2),
      m3: mc(a.m3, b.m3),
      meshStrength: lerp(a.meshStrength, b.meshStrength, t),
    };
  }

  function applyPalette(p, phaseLabel) {
    var r = document.documentElement;
    r.style.setProperty("--circ-grad-a-r", String(p.gradA.r));
    r.style.setProperty("--circ-grad-a-g", String(p.gradA.g));
    r.style.setProperty("--circ-grad-a-b", String(p.gradA.b));
    r.style.setProperty("--circ-grad-b-r", String(p.gradB.r));
    r.style.setProperty("--circ-grad-b-g", String(p.gradB.g));
    r.style.setProperty("--circ-grad-b-b", String(p.gradB.b));
    r.style.setProperty("--circ-m1-r", String(p.m1.r));
    r.style.setProperty("--circ-m1-g", String(p.m1.g));
    r.style.setProperty("--circ-m1-b", String(p.m1.b));
    r.style.setProperty("--circ-m2-r", String(p.m2.r));
    r.style.setProperty("--circ-m2-g", String(p.m2.g));
    r.style.setProperty("--circ-m2-b", String(p.m2.b));
    r.style.setProperty("--circ-m3-r", String(p.m3.r));
    r.style.setProperty("--circ-m3-g", String(p.m3.g));
    r.style.setProperty("--circ-m3-b", String(p.m3.b));
    r.style.setProperty("--circ-mesh-strength", String(p.meshStrength));
    r.setAttribute("data-circadian-phase", phaseLabel);
  }

  function phaseFor(now, st) {
    var dawn = st.dawn,
      sunrise = st.sunrise,
      gHe = st.goldenHour,
      sunset = st.sunset,
      dusk = st.dusk;

    if (!valid(dawn) || !valid(sunrise) || !valid(gHe) || !valid(sunset) || !valid(dusk)) {
      return { label: "day", palette: PAL.day, blend: 0 };
    }

    if (sunrise.getTime() >= gHe.getTime()) {
      gHe = new Date(sunset.getTime() - 75 * 60 * 1000);
    }
    if (gHe.getTime() >= sunset.getTime()) {
      gHe = new Date(sunset.getTime() - 45 * 60 * 1000);
    }
    if (sunset.getTime() >= dusk.getTime()) {
      dusk = new Date(sunset.getTime() + 50 * 60 * 1000);
    }

    var t = now.getTime();

    function seg(label, start, end, fromPal, toPal) {
      var s = start.getTime(),
        e = end.getTime();
      if (t < s || t >= e) return null;
      var u = e > s ? (t - s) / (e - s) : 0;
      return { label: label, palette: mixPal(fromPal, toPal, u), blend: u };
    }

    var preDawn = new Date(dawn.getTime() - 90 * 60 * 1000);
    if (t < dawn.getTime() && t >= preDawn.getTime()) {
      var u = (t - preDawn.getTime()) / (dawn.getTime() - preDawn.getTime());
      return { label: "night-dawn", palette: mixPal(PAL.night, PAL.dawn, u), blend: u };
    }

    if (t < dawn.getTime() || t >= dusk.getTime()) {
      if (t >= dusk.getTime()) {
        var post = new Date(dusk.getTime() + 2 * 60 * 60 * 1000);
        if (t < post.getTime()) {
          var u2 = (t - dusk.getTime()) / (post.getTime() - dusk.getTime());
          return { label: "dusk-night", palette: mixPal(PAL.dusk, PAL.night, u2), blend: u2 };
        }
      }
      return { label: "night", palette: PAL.night, blend: 0 };
    }

    var a;
    a = seg("dawn", dawn, sunrise, PAL.dawn, PAL.day);
    if (a) return a;

    a = seg("day", sunrise, gHe, PAL.day, PAL.golden);
    if (a) return a;

    a = seg("golden", gHe, sunset, PAL.golden, PAL.dusk);
    if (a) return a;

    a = seg("dusk", sunset, dusk, PAL.dusk, PAL.night);
    if (a) return a;

    return { label: "day", palette: PAL.day, blend: 0 };
  }

  function noonLocal(d) {
    var x = new Date(d);
    x.setHours(12, 0, 0, 0);
    return x;
  }

  function tick() {
    var coords = readCoords();
    var now = new Date();
    var st = getTimes(noonLocal(now), coords.lat, coords.lng, 0);
    var ph = phaseFor(now, st);
    applyPalette(ph.palette, ph.label);
  }

  tick();
  setInterval(tick, 60 * 1000);

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) tick();
  });
})();
