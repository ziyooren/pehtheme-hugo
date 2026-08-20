[English](README.md) | [中文](README.zh-CN.md)

# Pehtheme Hugo

An **independently maintained** Hugo minimalist blog theme, extended from [deining/pehtheme-hugo](https://github.com/deining/pehtheme-hugo). It keeps the original theme's minimalism and performance while adding a set of production-grade features: cookie consent management (Google Consent Mode v2), analytics/ads script injection, PaperMod content compatibility, standalone search & archives pages, inline ads, donation buttons and SEO enhancements.

Maintained by [@ziyooren](https://github.com/ziyooren), powering [theWindows12.com](https://www.thewindows12.com/) and [cnelecar.com](https://www.cnelecar.com/).

## Features

### Core (from upstream)
- Tailwind CSS, no third-party JS dependencies
- Client-side search (`index.json`, no backend)
- Homepage feature post (via the `feature` tag), homepage category section and Recent Post (featured/category picks are automatically excluded)
- Top menu, tag list, sidebar with recent posts / ad box
- Two-column blog layout, semantic HTML

### Extensions (added in this repo)
- **Cookie consent banner** (Google Consent Mode v2, relaxed mode): `top / modal / bottom` positions, accept / decline / per-category customization, footer "Cookie settings" to re-open anytime
- **Script injection**: GA4 / GTM / AdSense / custom head & body scripts, fully configurable
- **PaperMod content compatibility**: `cover.image` front matter, `video` shortcode, multi-instance search — migrate from PaperMod without touching content
- **Standalone `/search/` and `/archives/` pages** (`type: "search"` / `type: "archives"`)
- **Inline ads**: AdSense unit inserted before every `<h2>` in article content
- **Donation button** (Buy Me a Coffee, etc.)
- **Affiliate Disclosure** link in the article author line
- **SEO enhancements**: noindex on taxonomy pages (preserve crawl budget), page-type-aware structured data (WebSite / BlogPosting / WebPage / BreadcrumbList), full Open Graph & Twitter Card output, auto-summary fallback for empty descriptions
- Pagination respects the global `pagerSize`; image resolution supports remote URLs, page-bundle resources and assets

## Quick start

```bash
# Install as a submodule (recommended for easy updates)
git submodule add https://github.com/ziyooren/pehtheme-hugo.git themes/pehtheme-hugo

# Minimal hugo.toml
baseURL = 'https://example.com/'
languageCode = 'en-us'   # 'zh-cn' for Chinese sites
title = 'My Site'
theme = 'pehtheme-hugo'

[params]
  description = 'Site-wide meta description'
  mainSections = ['posts']   # post sections (default posts; use ['blog'] for blog sites)
```

See [exampleSite/hugo.toml](exampleSite/hugo.toml) for a fully commented reference configuration.

## Configuration reference

```toml
[params]
  description = '...'
  mainSections = ['posts']              # feeds homepage Recent Post / search / RSS
  logo = '/images/logo.png'             # custom header logo (transparent PNG friendly)
  og_image = '/images/default-og.png'   # fallback social share image
  home_category = 'News'                # homepage category section (shows 3 posts)
  affiliate_disclosure = '/affiliate-disclosure/'  # affiliate link in the author line
  affiliate_disclosure_label = 'Affiliate Disclosure'

  [params.author]                       # author info (author box / structured data)
    name = 'Your Name'
    bio = 'Short bio'
    avatar = '/images/avatar.png'
    twitter = 'https://x.com/you'       # accepts either twitter or x key

  [params.social]                       # footer social icons (unset entries hidden)
    facebook = '...'
    twitter = '...'
    github = '...'
    instagram = '...'

  [params.footer]                       # footer copy
    tagline = '...'
    description = '...'
    # copyright = '© 2026 ...'

  [params.banner]                       # sidebar ad box (optional)
    image = '/images/banner.png'
    alt = '...'

  [params.newsletter]                   # newsletter box (renders when action is set)
    title = '...'
    description = '...'
    action = 'https://example.com/subscribe'
    placeholder = 'Email...'
    button = 'Subscribe'

  # Cookie consent banner (Google Consent Mode v2, relaxed mode)
  [params.consent]
    position = 'bottom'                 # 'top' | 'modal' | 'bottom'
    title = 'We value your privacy'
    message = 'We use cookies to improve your experience and analyze site traffic.'
    accept = 'Accept all'
    decline = 'Decline'
    settings = 'Cookie settings'
    save = 'Save preferences'
    privacy_policy = '/privacy-policy/'
    policy_label = 'Privacy policy'

  # Analytics / ads / tag manager / custom scripts
  [params.scripts]
    analytics = 'G-XXXXXXXX'            # Google Analytics 4
    gtm = 'GTM-XXXXXX'                  # Google Tag Manager
    adsense = 'ca-pub-XXXXXXXX'         # Google AdSense
    head = []                           # custom <head> scripts
    body = []                           # custom </body> scripts

  # Inline ad (inserted before every <h2>)
  [params.adsense]
    client = 'ca-pub-XXXXXXXX'
    inline_slot = '1234567890'

  # Donation button
  [params.donate]
    url = 'https://buymeacoffee.com/yourname'
    image = 'https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png'
    text = 'Buy Me a Coffee'

  # SEO
  [params.seo]
    noindex_taxonomy = true             # noindex, follow on tag/category/section pages

[menu]                                  # top navigation
  [[menu.main]]
    name = 'Home'
    pageRef = '/'
    weight = 10
  [[menu.footer]]                       # footer extra links
    name = 'Privacy'
    pageRef = '/privacy-policy/'
    weight = 10
```

## Page types

| front matter `type` | Purpose | Template |
|---|---|---|
| (default) | posts / lists | `_default/single.html`, `_default/list.html` |
| `page` | standalone pages (About / Contact / Privacy) | `page/single.html` |
| `search` | search page (reuses index.json) | `search/single.html` |
| `archives` | yearly archives list | `archives/single.html` |

Homepage feature post: add the `feature` tag to a post (only the first match is shown; it is excluded from Recent Post automatically).

## Migrating from PaperMod

PaperMod content is compatible without modification:

- `cover.image` (page-bundle relative path or URL) works as the post cover; the standard `image` field is also supported
- The `video` shortcode (`{{< video src="..." >}}`) is built in
- Legacy PaperMod-only front matter fields (`showToc`, `canonicalURL`, etc.) are safely ignored — keep or remove them
- Pagination, archives and search URL structures match PaperMod defaults

## Development

```bash
cd exampleSite
hugo server -D
```

The example site mounts the theme `assets` into `static` via `[module.mounts]` for local development.

## Updating the theme

### Releasing a new theme version (maintainer)

```bash
cd /path/to/pehtheme-hugo          # theme repository
git add -A && git commit -m "..." && git push origin main
git tag -a v1.1.0 -m "..." && git push origin v1.1.0   # create a version tag
```

### Upgrading a site to a new theme version

Sites install the theme as a git submodule pinned to a released tag:

```bash
cd /path/to/site
cd themes/pehtheme-hugo && git fetch --tags && git checkout v1.1.0
cd ../.. && git add themes/pehtheme-hugo && git commit -m "Theme v1.1.0" && git push
```

The site's CI (e.g. Cloudflare Pages via `.github/workflows/deploy.yml`) rebuilds and deploys automatically. Verify locally first with `hugo server` whenever you like.

### Local development notes

- Sites pin the submodule to a **released tag** — uncommitted local changes in your theme checkout are **not** used by the site build.
- To preview a work-in-progress theme on a site: `hugo server --themesDir /path/to/theme-parent` (or temporarily `git checkout main` inside the submodule).
- Once the theme looks good, tag a new version and upgrade sites with the steps above.

## Credits

- Upstream theme: [deining/pehtheme-hugo](https://github.com/deining/pehtheme-hugo) by [fauzanmy](https://github.com/fauzanmy) — this repository is an extended, independently maintained version
- Thanks to the upstream for the minimalist design and the MIT license

## License

[MIT](LICENSE) — forked from upstream, original license retained.
