[English](README.md) | [中文](README.zh-CN.md)


# Pehtheme Hugo

一个基于 [deining/pehtheme-hugo](https://github.com/deining/pehtheme-hugo) 二次开发、**独立维护**的 Hugo 极简博客主题。在保留原主题极简、高性能特性的基础上，针对生产环境做了大量扩展：Cookie 同意管理（Google Consent Mode v2）、统计/广告脚本注入、PaperMod 内容兼容、独立搜索/归档页面、文内广告、打赏按钮、SEO 增强等。

由 [@ziyooren](https://github.com/ziyooren) 维护，实际用于 [theWindows12.com](https://www.thewindows12.com/) 与 [cnelecar.com](https://www.cnelecar.com/)。

## 功能特性

### 基础（源自上游）
- Tailwind CSS 构建，无第三方 JS 依赖
- 客户端搜索（index.json，无后端）
- 首页置顶文章（`feature` 标签）+ 首页分类栏目 + Recent Post（自动排除置顶/栏目文章）
- 顶部菜单、标签列表、侧边栏 Recent Post / 广告位
- 双栏博客布局、语义化 HTML

### 扩展（本仓库新增）
- **Cookie 同意横幅**（Google Consent Mode v2 宽松模式）：`top / modal / bottom` 三种位置，接受 / 拒绝 / 按类自定义，footer 可随时重新设置
- **脚本注入**：GA4 / GTM / AdSense / 自定义 head/body 脚本，全部配置化
- **PaperMod 内容兼容**：`cover.image` 封面字段、`video` shortcode、多实例搜索——从 PaperMod 迁移无需改内容
- **独立 `/search/` 与 `/archives/` 页面**（`type: "search"` / `type: "archives"`）
- **文内广告**：`<h2>` 前自动插入 AdSense 单元
- **打赏按钮**（Buy Me a Coffee 等）
- **Affiliate Disclosure** 链接（文章作者行）
- **SEO 增强**：分类/标签页 noindex（保护抓取预算）、结构化数据按页面类型区分（WebSite / BlogPosting / WebPage / BreadcrumbList）、og/twitter 卡片完整输出、空 description 自动摘要兜底
- 分页尊重全局 `pagerSize`；图片解析支持 远程 URL / page-bundle 资源 / assets 资源

## 快速开始

```bash
# 作为 submodule 安装（推荐，便于更新）
git submodule add https://github.com/ziyooren/pehtheme-hugo.git themes/pehtheme-hugo

# 最小配置 hugo.toml
baseURL = 'https://example.com/'
languageCode = 'en-us'   # 中文站用 zh-cn
title = 'My Site'
theme = 'pehtheme-hugo'

[params]
  description = 'Site-wide meta description'
  mainSections = ['posts']   # 文章 section（默认 posts；blog 站改为 ['blog']）
```

完整配置参考见 [exampleSite/hugo.toml](exampleSite/hugo.toml)（含全部可选配置的注释示例）。

## 配置参考

```toml
[params]
  description = '...'
  mainSections = ['posts']          # 首页 Recent Post / 搜索 / RSS 收录范围
  logo = '/images/logo.png'         # 自定义 header logo（透明背景 PNG 友好）
  og_image = '/images/default-og.png'   # 社交分享兜底图
  home_category = 'News'            # 首页分类栏目（显示该分类 3 篇）
  affiliate_disclosure = '/affiliate-disclosure/'  # 文章作者行 Affiliate 链接
  affiliate_disclosure_label = 'Affiliate Disclosure'

  [params.author]                   # 作者信息（作者框 / 结构化数据）
    name = 'Your Name'
    bio = 'Short bio'
    avatar = '/images/avatar.png'
    twitter = 'https://x.com/you'   # 兼容 twitter 或 x 键

  [params.social]                   # footer 社交图标（未配置自动隐藏）
    facebook = '...'
    twitter = '...'
    github = '...'
    instagram = '...'

  [params.footer]                   # footer 文案
    tagline = '...'
    description = '...'
    # copyright = '© 2026 ...'

  [params.banner]                   # 侧边栏广告位（可选）
    image = '/images/banner.png'
    alt = '...'

  [params.newsletter]               # 邮件订阅（配置 action 才显示）
    title = '...'
    description = '...'
    action = 'https://example.com/subscribe'
    placeholder = 'Email...'
    button = 'Subscribe'

  # Cookie 同意横幅（Google Consent Mode v2 宽松模式）
  [params.consent]
    position = 'bottom'             # 'top' | 'modal' | 'bottom'
    title = 'We value your privacy'
    message = 'We use cookies to improve your experience and analyze site traffic.'
    accept = 'Accept all'
    decline = 'Decline'
    settings = 'Cookie settings'
    save = 'Save preferences'
    privacy_policy = '/privacy-policy/'
    policy_label = 'Privacy policy'

  # 统计 / 广告 / 标签管理 / 自定义脚本
  [params.scripts]
    analytics = 'G-XXXXXXXX'        # GA4
    gtm = 'GTM-XXXXXX'              # Google Tag Manager
    adsense = 'ca-pub-XXXXXXXX'     # Google AdSense
    head = []                       # 自定义 <head> 脚本
    body = []                       # 自定义 </body> 脚本

  # 文内广告（每个 <h2> 前插入）
  [params.adsense]
    client = 'ca-pub-XXXXXXXX'
    inline_slot = '1234567890'

  # 打赏按钮
  [params.donate]
    url = 'https://buymeacoffee.com/yourname'
    image = 'https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png'
    text = 'Buy Me a Coffee'

  # SEO
  [params.seo]
    noindex_taxonomy = true         # 分类/标签页 noindex

[menu]                              # 顶部菜单
  [[menu.main]]
    name = 'Home'
    pageRef = '/'
    weight = 10
  [[menu.footer]]                   # footer 附加链接
    name = 'Privacy'
    pageRef = '/privacy-policy/'
    weight = 10
```

## 页面类型

| front matter `type` | 用途 | 模板 |
|---|---|---|
| （默认） | 文章 / 列表 | `_default/single.html`、`_default/list.html` |
| `page` | 独立页（About / Contact / Privacy） | `page/single.html` |
| `search` | 搜索页（复用 index.json） | `search/single.html` |
| `archives` | 归档页（按年分组） | `archives/single.html` |

首页置顶：给文章的 `tags` 加 `feature`（仅第一篇生效，自动从 Recent Post 排除）。

## 从 PaperMod 迁移

本主题对 PaperMod 内容做了兼容，迁移无需修改文章：

- `cover.image`（Page bundle 相对路径或 URL）可直接作为封面使用，也支持标准 `image` 字段
- `video` shortcode（`{{< video src="..." >}}`）内置支持
- 旧 PaperMod 专属 front matter 字段（`showToc`、`canonicalURL` 等）会被安全忽略，可留可删
- 分页、归档、搜索 URL 结构与 PaperMod 默认一致

## 开发

```bash
cd exampleSite
hugo server -D
```

示例站配置了 `[module.mounts]` 将主题 `assets` 挂载为 `static`，便于本地开发。

## 主题更新与站点升级

### 发布主题新版本（维护者）

```bash
cd /path/to/pehtheme-hugo          # 主题仓库
git add -A && git commit -m "..." && git push origin main
git tag -a v1.1.0 -m "..." && git push origin v1.1.0   # 打版本标签
```

### 站点升级到新主题版本

站点以 git submodule 方式安装主题，并固定到某个已发布的标签：

```bash
cd /path/to/site
cd themes/pehtheme-hugo && git fetch --tags && git checkout v1.1.0
cd ../.. && git add themes/pehtheme-hugo && git commit -m "Theme v1.1.0" && git push
```

站点的 CI（如 Cloudflare Pages 的 `.github/workflows/deploy.yml`）会自动重新构建并部署。如需先在本地验证，可先运行 `hugo server`。

### 本地开发注意事项

- 站点 submodule **固定到已发布的标签**——你在主题仓库里的本地改动（未提交/未发版）**不会**被站点构建使用。
- 想在站点上预览未发布的主题：`hugo server --themesDir /path/to/theme-parent`（或临时在 submodule 内 `git checkout main`）。
- 主题验证无误后，按上面的步骤打新标签并升级各站点。

## 致谢

- 上游主题：[deining/pehtheme-hugo](https://github.com/deining/pehtheme-hugo)（作者 [fauzanmy](https://github.com/fauzanmy)），本仓库为其扩展维护版
- 感谢上游的极简设计与 MIT 许可

## License

[MIT](LICENSE) — fork 自上游，保留原始许可。
