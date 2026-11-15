# AGENTS.md — pehtheme-hugo fork

> Written 2026-08-31 by an AI session. Working copy:
> `/Users/louis/Dev/AI/ptheme/pehtheme-hugo` (origin:
> `https://github.com/ziyooren/pehtheme-hugo.git`, branch `main`).
> Fork of the upstream pehtheme-hugo Hugo theme; only `origin` is configured.

## Consumers — every change must work for both

| Site | Local path | Notes |
|---|---|---|
| cnelecar.com | `/Users/louis/Dev/blog/cnelecar-new` | `seo.noindex_taxonomy: true`, `home_title_suffix` set |
| thewindows12.com | `/Users/louis/Dev/blog/theWindows12-new` | same flags; kept structurally identical to cnelecar |

Both sites consume this repo as a **git submodule pinned to a commit** and
deploy via GitHub Actions that check the submodule out **from GitHub** —
so `git push` here must happen **before** submodule pin bumps in the sites.

## Feature contracts implemented on top of upstream

Site params (all optional, all default to upstream behavior when unset):

- `params.home_title_suffix` — homepage `<title>`/`og:title`/`twitter:title`
  become `"<site.Title> | <suffix>"`; unset = upstream behavior (`site.Title`).
- `params.seo.noindex_taxonomy: true` — taxonomy list pages (terms, plus the
  `/tags/` and `/categories/` roots) & section list pages
  render `<meta name="robots" content="noindex, follow">` (upstream had this).
- `params.adsense.inline_every` / `.inline_max` — place an inline ad before
  every Nth `<h2>` and stop after N units per post. Defaults `1` / `99`
  reproduce the old "before every `<h2>`, uncapped" behavior; `inline_max: 0`
  turns the units off without touching the `params.scripts.adsense` loader.

Front matter keys on any page:

- `noindex: true` — renders `noindex, follow` robots meta (e.g. search pages).
- `sitemapExclude: true` — page left out of `sitemap.xml`.

Invariants to preserve when editing:

1. **Sitemap and robots meta must agree.** With `noindex_taxonomy` on, the
   custom `layouts/sitemap.xml` excludes taxonomy/section pages; pages with
   `noindex: true` are excluded from the sitemap too.
2. **Everything is opt-in.** A site that sets none of the above must render
   byte-identical output to upstream pehtheme-hugo.

## How to test before pushing

Point each site's submodule working tree at fork HEAD (or temporarily copy the
changed files in), run `hugo --minify` in both site repos, and check:

- sitemap `<loc>` count and composition (2026-11-16: cnelecar 89 URLs = 83 posts
  + 6 pages; theWindows12 102 = 96 + 6; zero tags/categories while
  `noindex_taxonomy` is on)
- home page title, `/search/` robots meta, one post's BlogPosting JSON-LD

Local toolchain is Hugo 0.169; Cloudflare Pages runs the same version since
2026-11-16 (it used to pin 0.153.2, which is worth remembering when reading
older commit messages).

Then: commit, **push**, and bump the pin in both sites
(`themes/pehtheme-hugo` → `git fetch && git checkout main && git pull`),
build, commit the bump, push each site (each push auto-deploys to
Cloudflare Pages and purges the CF cache).

## History notes

- This fork has accumulated real fixes beyond upstream (GA4 gtag loading,
  Consent Mode v2 regional defaults, AdSense unit CSS, og_image absolutizing,
  responsive tables, inline-code chip replacing Tailwind Typography's literal
  backticks). Tags: `v1.0.0`, `v1.0.2` (+2 commits as of 2026-08-31,
  `17d389a` = SEO toolkit: home title suffix, per-page noindex, gated sitemap).
- Upstream pulls are not routine; if syncing upstream later, diff against
  `layouts/partials/head.html` and `layouts/sitemap.xml` first — that's where
  the fork diverges most.
