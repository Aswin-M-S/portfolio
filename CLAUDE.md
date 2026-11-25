# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio website: static, plain HTML/CSS/JS with no build step or dependencies. Hosted free on GitHub Pages, so `index.html` must stay at the repo root and all asset paths must be relative.

## Running locally

Open `index.html` in a browser, or serve the folder (e.g. `python -m http.server 8000`). There is no build, lint, or test tooling.

## Structure

- `index.html`: all content, as sections (`#work`, `#support`, `#ai`, `#experiments`, `#skills`, `#certs`, `#contact`). Content is real, taken from the owner's own profile summary. Don't add claims beyond it (no Copilot Studio/AI Builder production work, no SPFx/ITIL, no revenue figures).
- `styles.css`: Apple-style design. Colors are CSS variables in `:root`, with a `prefers-color-scheme: dark` override, so change colors there rather than inline. Mobile breakpoint is 700px.
- `script.js`: mobile menu toggle, footer year, scroll-reveal via IntersectionObserver (any element with class `reveal` fades in on scroll), and the day/night toggle.
- `icons/`: local Simple Icons SVGs (CC0) used for the tech-stack grid. They are rendered as CSS masks, tinted by the `--c` variable set inline on each `<i>`; no `--c` means they follow the text color.

## Theming

Dark mode follows the system by default. The toggle sets `data-theme="light|dark"` on `<html>` and saves it in localStorage; an inline script in `<head>` applies it before paint to avoid a flash. Dark-mode variables are defined twice in `styles.css` (the media query and `[data-theme="dark"]`), so change both.

## Search and sharing

`index.html` carries Open Graph/Twitter tags (preview image `og-image.png`, 1200x630) and Person JSON-LD; `sitemap.xml` and `robots.txt` use the absolute URL `https://aswin-m-s.github.io/portfolio/`, so update them if the domain changes. Favicons: `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`.

## Analytics

GoatCounter (cookie-free) counts visits via the script tag at the end of `index.html`; the dashboard is `https://aswinms.goatcounter.com`. No cookie banner is needed, so don't add other trackers without revisiting that.

## External links

`script.js` marks every off-site link (`a.ext`, `rel="noopener noreferrer"`). They open in the same tab unless a visitor switches on "Open external links in a new tab" in the footer; that choice is saved in localStorage (`newTab`). Off-site links added later get this behavior automatically.

## Accessibility options

An icon button in the header (`#a11yBtnTop`) opens a panel (`#a11yPanel`) under the header with text size, high contrast, reduce motion, readable font (Atkinson Hyperlegible), more text spacing and underline links. State is saved in localStorage (`a11y`) and applied as classes/`data-ts` on `<html>`; an inline script in `<head>` applies it before paint. Reduce motion defaults on when the OS asks for it. New components should use the CSS variables so high contrast keeps working. Text size uses CSS `zoom` on `body`.

## Accessibility audit notes

Audited with axe-core in dark, light and high-contrast modes: 0 violations. Colours were chosen to keep contrast: `--btn` (white text on buttons), `--accent` (link text), `--ga/--gb/--gc` (headline gradient) and `--muted-hero` (text over the hero glow) differ between light and dark. Bright gradients behind white text (`.t1`-`.t4` banners) must stay dark enough for white 12-15px text. Hero overlays make automated contrast checks inconclusive, so re-check those by hand if the hero changes. Not tested: screen readers, 200% zoom, real keyboard walk-through.

## 404 page and print

`404.html` is the custom GitHub Pages error page; it uses absolute `/portfolio/...` paths because it can be served from any URL depth, so change those if the site moves to a custom domain at the root. A `@media print` block at the end of `styles.css` gives a compact black-on-white printout (no nav/panels, URLs shown after external links, final stat values via a `beforeprint` handler in `script.js`).
