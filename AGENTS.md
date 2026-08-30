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
- `params.seo.noindex_taxonomy: true` — taxonomy terms & section list pages
  render `<meta name="robots" content="noindex, follow">` (upstream had this).

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

- sitemap `<loc>` count and composition (cnelecar: 84 URLs = 78 posts + 6 pages;
  theWindows12: 100 = 94 + 6; zero tags/categories while `noindex_taxonomy` is on)
- home page title, `/search/` robots meta, one post's BlogPosting JSON-LD

Then: commit, **push**, and bump the pin in both sites
(`themes/pehtheme-hugo` → `git fetch && git checkout main && git pull`),
build, commit the bump, push each site (each push auto-deploys to
Cloudflare Pages and purges the CF cache).

## History notes

- This fork has accumulated real fixes beyond upstream (GA4 gtag loading,
  Consent Mode v2 regional defaults, AdSense unit CSS, og_image absolutizing,
  responsive tables). Tags: `v1.0.0`, `v1.0.2` (+2 commits as of 2026-08-31,
  `17d389a` = SEO toolkit: home title suffix, per-page noindex, gated sitemap).
- Upstream pulls are not routine; if syncing upstream later, diff against
  `layouts/partials/head.html` and `layouts/sitemap.xml` first — that's where
  the fork diverges most.
