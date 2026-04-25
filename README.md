# glassy-start

A modular, local browser start page with a **glassmorphism** look: frosted cards over a deep, animated gradient mesh. There is no build step — only HTML, CSS, and vanilla JavaScript. It is designed to open from disk (`file://`) without a server.

## Design references

Glassmorphism inspiration and tooling:

- [UI Glass — CSS glassmorphism generator](https://ui.glass/generator)
- [themesberg/glass-ui (GitHub)](https://github.com/themesberg/glass-ui)
- [rahuldotdev/glassmorphism (GitHub)](https://github.com/rahuldotdev/glassmorphism)

## What is included

- **Core styles**: `css/glass.css` (tokens, page background, glass card chrome), `css/layout.css` (responsive grid).
- **Cards** (each in its own folder under `cards/`): clock, bookmarks, greeting.
- **Loader**: `js/loader.js` registers which cards appear and how they span the grid.
- **Circadian background**: `js/circadian.js` drives the mesh and sky gradient from **sunrise, sunset, civil dawn/dusk, and evening golden hour** for your coordinates (defaults are NYC). The `<html>` element gets a `data-circadian-phase` attribute you can use for debugging or extra CSS. Solar math is a small excerpt from [SunCalc](https://github.com/mourner/suncalc) (MIT).

Cards are loaded as **standalone HTML pages inside iframes**. That keeps each card self-contained (scoped CSS + JS) and avoids browser restrictions on `fetch()` for other local files when using `file://`.

## Set it up as the Chrome new tab page

Chrome does not let you set `file://` as the built-in new tab URL directly. Practical options:

1. **New Tab Redirect** (or similar extension)  
   Install an extension that redirects the new tab to a URL you choose. Point it at your local file, for example:  
   `file:///Users/randall/VS%20Code/glassy-start/index.html`  
   Enable the extension’s permission to access file URLs if prompted.

2. **Local static server** (optional for development)  
   From the project directory: `python3 -m http.server 8080` then open `http://127.0.0.1:8080/`. Not required for normal use if the extension loads the `file://` path correctly.

After setup, open a new tab to confirm the page loads and fonts (Google Fonts) are allowed if you are offline or blocking third-party resources.

## Circadian background (location)

Edit **`index.html`**: set `data-latitude` and `data-longitude` on the `<html>` tag to your location (decimal degrees, WGS84). Example:

```html
<html lang="en" data-latitude="37.7749" data-longitude="-122.4194">
```

The page refreshes solar phases about **every minute** and whenever you return to the tab. Phases blend gradually (for example night → dawn in the last 90 minutes before civil dawn, dusk → night for two hours after civil dusk ends).

## Add a new card

1. Create a folder under `cards/your-card/`.
2. Add a **full HTML document** (e.g. `your-card.html`) that links `../../css/card-base.css` plus your own `your-card.css` / `your-card.js` as needed. Use a transparent `body` background so the parent glass frame shows through.
3. Register the card in **`js/loader.js`**: append an object to the `CARDS` array with `id`, `title`, `src` (path to the HTML file), and `span` (`wide`, `narrow`, `half`, or `full`). See existing entries for examples.
4. Optionally add layout hints in **`css/layout.css`** for `.glass-card[data-card-id="your-card"]` (e.g. `min-height`).

## Remove a card

Delete its entry from the `CARDS` array in `js/loader.js`. You can delete the card’s folder whenever you no longer need the files.

## Bookmarks configuration

Edit the JSON inside `cards/bookmarks/bookmarks.html` (the `<script type="application/json" id="bookmarks-data">` block). Each entry supports `label`, `url`, and optional `icon` (emoji or short text). If `icon` is omitted, the first letter of `label` is shown.

## Background images

Drop images in `assets/backgrounds/` and reference them from CSS (for example in `css/glass.css` or a card stylesheet) when you want a photo layer behind the mesh.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE).
