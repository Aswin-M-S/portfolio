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
