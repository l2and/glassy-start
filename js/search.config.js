/**
 * Search engines for the Search card (`cards/search/`).
 *
 * Each engine needs:
 *   - `id` — stable key; `defaultEngine` must match one of these.
 *   - `label` — shown in the engine dropdown.
 *   - `url` — template with `%s` where the query goes (encoded with encodeURIComponent).
 *
 * Examples (same pattern as browser “site search” shortcuts):
 *   Google:     https://www.google.com/search?q=%s
 *   DuckDuckGo: https://duckduckgo.com/?q=%s
 *   Wikipedia:  https://en.wikipedia.org/wiki/Special:Search?search=%s
 */
window.GLASSY_SEARCH = {
  defaultEngine: "google",
  engines: [
    {
      id: "google",
      label: "Google",
      url: "https://www.google.com/search?q=%s",
    },
    {
      id: "duckduckgo",
      label: "DuckDuckGo",
      url: "https://duckduckgo.com/?q=%s",
    },
  ],
};
