---
name: Seismo Guard workspace instructions
description: "Project-wide guidance for editing the Seismo Guard static landing site, translations, downloads, and site styling."
applyTo:
  - "**/*.html"
  - "**/*.css"
  - "**/*.js"
  - "**/*.md"
  - "netlify.toml"
---

## Project Overview

Seismo Guard is a static web landing site for an earthquake warning and IoT sensor product. The codebase is vanilla HTML, CSS, and JavaScript only. There is no package manager configuration (`package.json`, `yarn.lock`, etc.) and no frontend framework.

## Key Files

- `index.html`: main landing page and page structure.
- `css/`: all styling and responsive layout rules.
- `js/`: frontend behavior, translations, and UI interaction.
- `assets/`: images, icons, backgrounds, logos, and downloads resources.
- `downloads/`: packaged installer artifacts for Android, iOS, Linux, macOS, and Windows.
- `netlify.toml`: static hosting configuration placeholder.
- `README.md`: currently empty; avoid assuming documentation is available.

## Conventions

- Use plain HTML and CSS patterns rather than framework-specific syntax.
- Keep JavaScript simple and DOM-based. Prefer direct DOM manipulation and small utility functions.
- Translation strings are defined in `js/languages.js` and matched by `data-i18n` attributes in HTML.
- Responsive behavior is controlled in `css/responsive.css` and `css/animations.css`.
- Treat `netlify.toml` as static deployment metadata; do not add build-step configuration unless the repository is updated with a package or build system.

## Editing Guidance

- For content updates, edit `index.html` and keep HTML semantics intact.
- For style changes, use `css/*.css` and preserve responsive breakpoints.
- For JavaScript changes, edit `js/*.js`; avoid introducing new dependencies.
- If adding new translated text, add the key to `js/languages.js` and the same `data-i18n` key to `index.html`.

## Deployment and Preview

- This site can be previewed by opening `index.html` locally or serving the folder with a simple static server.
- There is no existing build pipeline in the repository, so changes should remain runnable as plain static assets.

## When to Use These Instructions

Use this guidance when working on:
- landing page content or layout
- responsive design fixes
- translation and internationalization updates
- JavaScript behavior for UI elements
- asset updates and static site hosting config

## Example Prompts

- "Update the hero section copy and ensure the layout stays responsive on mobile."
- "Translate the download section into Spanish and add the missing `data-i18n` keys."
- "Improve the `Latest Earthquake` card styling without adding a new JS dependency."
- "Fix the scroll reveal animations in `js/scroll.js` so they work on slow devices."
