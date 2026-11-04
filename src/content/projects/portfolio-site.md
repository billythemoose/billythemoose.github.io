---
title: Portfolio Site
description: this site, rebuilt from Jekyll to Astro
category: technical
importance: 1
repo: https://github.com/billythemoose/portfolio
---

This site started as a Jekyll project built on the al-folio academic theme and deployed to GitHub Pages. It has been rebuilt with [Astro](https://astro.build/) and [Tailwind CSS](https://tailwindcss.com/), keeping the same design, content, and URLs.

## Highlights

- Blog posts, projects, and the CV live in type-checked content collections, so bad front matter fails the build instead of breaking a page.
- Every page is static HTML. The only client-side JavaScript is the theme toggle, the mobile menu, and the reading progress bar.
- The build needs only Node. The Ruby, Python, and ImageMagick dependencies from the Jekyll setup are gone.
- CI checks that every URL from the old site still resolves.
