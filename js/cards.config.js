/**
 * Card visibility and order for glassy-start.
 *
 * Toggle any card with `enabled: false`. Order follows this array.
 * Loaded before `loader.js` (see index.html).
 */
window.GLASSY_CARDS = [
  {
    id: "search",
    title: "Search",
    src: "cards/search/search.html",
    span: "wide",
    enabled: true,
  },
  {
    id: "greeting",
    title: "Greeting",
    src: "cards/greeting/greeting.html",
    span: "wide",
    enabled: true,
  },
  {
    id: "clock",
    title: "Clock",
    src: "cards/clock/clock.html",
    span: "narrow",
    enabled: true,
  },
  {
    id: "clock-weather",
    title: "Clock & weather",
    src: "cards/clock-weather/clock-weather.html",
    span: "narrow",
    enabled: true,
  },
  {
    id: "bookmarks",
    title: "Bookmarks",
    src: "cards/bookmarks/bookmarks.html",
    span: "full",
    enabled: true,
  },
];

/**
 * Image options read by card iframes (clock-weather) via parent.GLASSY_IMAGE_OPTIONS
 * when same-origin. Set `weatherIcons.theme` to null to use icon.svg / icon.png only.
 *
 * Each theme lists `filePrefix` (your naming convention: basenames start with this)
 * and `files`: map of condition folder → filename in assets/weather-icons/<folder>/.
 * Omit a folder to fall back to icon.png → icon.svg → emoji.
 * Filenames are treated as PNG; you may omit `.png` and it will be added.
 */
window.GLASSY_IMAGE_OPTIONS = {
  weatherIcons: {
    theme: "DoesHoes",
    themes: {
      DoesHoes: {
        filePrefix: "Does",
        files: {
          clear: "DoesTanners_clear.png",
          cloudy: "DoesAreWet_clear.png",
          drizzle: "DoesAreWet_clear.png",
          fog: "DoesCaptains.png",
          rain: "DoesAreWet_clear.png",
        },
      },
    },
  },
};
