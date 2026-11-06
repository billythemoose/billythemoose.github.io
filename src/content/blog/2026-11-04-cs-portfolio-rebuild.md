---
title: Rebuilding the Portfolio Site
date: 2026-11-04 12:00:00
description: moving a template-based jekyll site from github pages to astro on aws
tags: astro typescript aws migration
categories: project
---

## One-Line Summary

I moved this site from a template-based Jekyll site on GitHub Pages to an Astro site on AWS under a personal domain, reducing the overall footprint from around 513 KB down to 28 KB.

## Where It Started

In January 2024 I forked [al-folio](https://github.com/alshedivat/al-folio), a popular Jekyll theme for academic portfolios, and published it to `billythemoose.github.io`. A GitHub Actions workflow built the site and pushed the output to a GitHub specific release branch which GitHub Pages served for free. Over the next couple of months I trimmed the template down, removing publications and extra profiles in preparation for future projects. In July 2024 I wrote my first post. Two years later, in July 2026, I added two case studies and refreshed my CV.

The site worked, but it carried a lot it didn't use. al-folio is built for academics. It supports citations, Jupyter notebooks, math, diagrams and responsive image sets, and the build needed all of it whether I used it or not. My site was two posts, a CV and a resume PDF.

<figure>
<svg viewBox="0 0 760 190" role="img" aria-labelledby="tl-title tl-desc" class="dg-timeline" style="width:100%;height:auto">
<title id="tl-title">Timeline of this site, January 2024 to November 2026</title>
<desc id="tl-desc">January 2024: forked al-folio onto GitHub Pages. February to March 2024: trimmed the template. July 2024: first post. July 2026: two case studies. November 2, 2026: Astro rebuild. November 3: AWS stack. November 4: repo renamed and GitHub Pages retired.</desc>
<style>
.dg-timeline text{fill:var(--global-text-color);font-size:12px;text-anchor:middle}
.dg-timeline .date{font-weight:500}
.dg-timeline .axis{stroke:var(--global-text-color-light);stroke-width:2}
.dg-timeline .gap{stroke:var(--global-text-color-light);stroke-width:2;stroke-dasharray:4 4}
.dg-timeline .tick{stroke:var(--global-text-color-light);stroke-width:1}
.dg-timeline .old{fill:var(--global-text-color-light)}
.dg-timeline .new{fill:var(--global-theme-color)}
.dg-timeline .ring{stroke:var(--global-bg-color);stroke-width:2}
</style>
<line class="axis" x1="30" y1="95" x2="285" y2="95"/>
<line class="gap" x1="285" y1="95" x2="365" y2="95"/>
<line class="axis" x1="365" y1="95" x2="730" y2="95"/>
<text x="325" y="88" style="font-size:11px;fill:var(--global-text-color-light)">2 years</text>
<line class="tick" x1="50" y1="75" x2="50" y2="89"/><circle class="old ring" cx="50" cy="95" r="6"/>
<text class="date" x="50" y="40">Jan 2024</text><text x="50" y="55">Fork al-folio,</text><text x="50" y="69">GitHub Pages</text>
<line class="tick" x1="160" y1="101" x2="160" y2="115"/><circle class="old ring" cx="160" cy="95" r="6"/>
<text class="date" x="160" y="132">Feb–Mar 2024</text><text x="160" y="147">Trim the</text><text x="160" y="161">template</text>
<line class="tick" x1="270" y1="75" x2="270" y2="89"/><circle class="old ring" cx="270" cy="95" r="6"/>
<text class="date" x="270" y="55">Jul 2024</text><text x="270" y="69">First post</text>
<line class="tick" x1="380" y1="101" x2="380" y2="115"/><circle class="old ring" cx="380" cy="95" r="6"/>
<text class="date" x="380" y="132">Jul 2026</text><text x="380" y="147">Two case</text><text x="380" y="161">studies</text>
<line class="tick" x1="490" y1="75" x2="490" y2="89"/><circle class="new ring" cx="490" cy="95" r="6"/>
<text class="date" x="490" y="55">Nov 2, 2026</text><text x="490" y="69">Astro rebuild</text>
<line class="tick" x1="600" y1="101" x2="600" y2="115"/><circle class="new ring" cx="600" cy="95" r="6"/>
<text class="date" x="600" y="132">Nov 3, 2026</text><text x="600" y="147">AWS stack</text><text x="600" y="161">and deploy</text>
<line class="tick" x1="705" y1="75" x2="705" y2="89"/><circle class="new ring" cx="705" cy="95" r="6"/>
<text class="date" x="705" y="40">Nov 4, 2026</text><text x="705" y="55">Repo renamed,</text><text x="705" y="69">Pages retired</text>
</svg>
</figure>


## Why Change

I had three goals:

1. **A domain I own**, managed in AWS, instead of a `github.io` subdomain.
2. **Room for demos.** I want to host unrelated side projects on subdomains of the same domain and link to them from here.
3. **Low cost, automated deploys.** Pushing to `master` should be the whole release process.

## Constraints

- **No broken links.** Every page anyone could have bookmarked or linked to keeps the same path.
- **Same look, for now.** Matching the existing design kept the scope bounded. A redesign can be its own project.
- **About a dollar a month.** GitHub Pages was free, and paying for a domain was fine, but paying for idle servers wasn't.

## Decision Points

### 1. Keep Jekyll, trim it, or rebuild

There were three options. Keep al-folio as-is, which is zero effort but has a cumbersome build process. Strip it down to plain Jekyll, which takes an afternoon but still means Liquid templates and a Ruby toolchain. Or rebuild in [Astro](https://astro.build/). I chose Astro. With two posts and a CV, migrating would never be cheaper than it was now. Astro's component model makes the design easy to change later. Its "islands" let me embed an interactive demo in a page without shipping JavaScript everywhere else. And it's TypeScript, which matches part of the stack I already maintain.

<figure>
<svg viewBox="0 0 760 230" role="img" aria-labelledby="tc-title tc-desc" class="dg-toolchain" style="width:100%;height:auto">
<title id="tc-title">Build toolchain before and after</title>
<desc id="tc-desc">The Jekyll build needed Ruby with Bundler gems, Python with Jupyter, Node with mermaid-cli and purgecss, and ImageMagick. The Astro build needs only Node 24.</desc>
<style>
.dg-toolchain text{fill:var(--global-text-color);font-size:13px}
.dg-toolchain .head{font-weight:500;font-size:14px}
.dg-toolchain .sub{fill:var(--global-text-color-light);font-size:12px}
.dg-toolchain .box{fill:var(--global-card-bg-color);stroke:var(--global-text-color-light);stroke-width:1}
.dg-toolchain .keep{fill:var(--global-card-bg-color);stroke:var(--global-theme-color);stroke-width:2}
.dg-toolchain .arrow{stroke:var(--global-text-color-light);stroke-width:2;fill:none}
.dg-toolchain .head-fill{fill:var(--global-text-color-light)}
</style>
<text class="head" x="20" y="24">Jekyll build (al-folio)</text>
<rect class="box" x="20" y="38" width="320" height="38" rx="4"/><text x="34" y="62">Ruby 3.2 · Bundler gems, incl. mini_racer</text>
<rect class="box" x="20" y="84" width="320" height="38" rx="4"/><text x="34" y="108">Python · Jupyter for notebook posts</text>
<rect class="box" x="20" y="130" width="320" height="38" rx="4"/><text x="34" y="154">Node · mermaid-cli, purgecss</text>
<rect class="box" x="20" y="176" width="320" height="38" rx="4"/><text x="34" y="200">ImageMagick · responsive image sets</text>
<path class="arrow" d="M352 126 H418"/><path class="head-fill" d="M428 126 L416 120 L416 132 Z"/>
<text class="head" x="440" y="24">Astro build</text>
<rect class="keep" x="440" y="107" width="300" height="38" rx="4"/><text x="454" y="131">Node 24 · npm ci</text>
<text class="sub" x="440" y="168">astro, tailwindcss, typescript</text>
<text class="sub" x="440" y="186">Images optimized by astro:assets</text>
</svg>
</figure>
</br>

### 2. Which goes first, the framework or the hosting

Either order works, because the AWS deploy step only uploads a folder of static files. It doesn't care whether Jekyll or Astro produced them. I did Astro first, on a branch, with a temporary GitHub Pages deploy, so I could compare the two sites side by side before changing anything users would see. AWS came second, once the new site was finished.

### 3. Redesign or match

I matched the existing look: same layout, same colors, same light and dark themes. Redesigning at the same time as a migration means every visual difference is either a bug or a choice, and you can't tell which. Matching first made "does it look right?" a yes-or-no question.

### 4. Styling

al-folio used Bootstrap and Material Design for Bootstrap from a CDN. I rebuilt the styles in [Tailwind CSS](https://tailwindcss.com/), and wrote the Markdown styles to copy the old look. I skipped Tailwind's typography plugin, because writing a short stylesheet matched the old look more closely than overriding the plugin's defaults would have.

### 5. Treating URLs as a contract

Before writing any code, I saved every URL in the live site's sitemap, plus a few files the sitemap didn't list, to a text file. A script checks that each one exists in the build, and CI runs it on every pull request. Twelve URLs had to survive. Seven were template placeholders or replaced files, like the sample news posts and the old `sitemap.xml`, and are marked as dropped on purpose. Broken inbound links are the cost of a migration that nobody notices until someone clicks one, so I wanted that check to be automatic.

### 6. Where to host

I compared five options:

- **GitHub Pages:** free, but no AWS-owned domain and no backends for demos.
- **S3 + CloudFront:** pennies a month for static sites.
- **AWS Amplify:** good for server-rendered apps, but more than a static site needs.
- **A small Lightsail server:** $5–12 a month whether anyone visits or not.
- **Fargate behind a load balancer:** $25–50 a month per demo.

I chose S3 and CloudFront, with ACM for the certificate and Route 53 for DNS. Amplify stays an option for a future demo that needs server rendering.

### 7. Subdomains or paths for demos

Future demos go on subdomains (`demo.example.com`), not paths (`example.com/demo`). Each subdomain is its own browser origin, so a bug in a demo can't read anything from the main site. No app needs a base-path setting. And each one can be hosted wherever suits it, since a subdomain is just a DNS record. The certificate is a wildcard, so new subdomains don't need a new one.

### 8. Infrastructure as code

I used the [AWS CDK](https://aws.amazon.com/cdk/) in TypeScript rather than Terraform, so the site and its infrastructure share one language. My original plan put the infrastructure in a separate repository that future demos could share. For one stack that was more ceremony than it was worth, so it lives in an `infra/` folder in this repo. I'll split it out when the first demo needs it.

### 9. How deploys reach AWS

I could have used CodePipeline, a script I run by hand, or GitHub Actions. I chose GitHub Actions with OpenID Connect (OIDC). Each workflow run gets a short-lived token from GitHub and trades it for temporary AWS credentials. It's free, and it only changed the last step of the workflow I already had.

### 10. What the deploy role can do

The deploy role can list, upload and delete objects in one bucket and invalidate one CloudFront distribution, and nothing else. It can't even read objects back. `aws s3 sync` compares files by listing them, so it never needs to read. If the role were ever misused, the worst it could do is replace this site.

### 11. Caching

Astro puts content hashes in asset filenames, so a changed file always gets a new name. That makes it safe to tell browsers to cache everything under `_astro/` for a year. HTML is the opposite: browsers check for a new version on every visit, CloudFront caches it for a day, and every deploy clears CloudFront's cache. Visitors get fresh pages right after a deploy without downloading unchanged assets again.

### 12. Retiring the old site

Two copies of the same site split search traffic and confuse anyone comparing them. GitHub only serves a user site from a repository named `<username>.github.io`, so renaming the repository to `portfolio` took `billythemoose.github.io` offline. Because the paths are the same on the new domain, an old link works again once you change the domain.

## Execution

I planned the work in ten phases: prep, scaffold, content collections, layouts, pages, assets, parity checks, CI, cleanup, and the move to AWS. I estimated 17–28 hours. The work ran from November 2 to November 4, 2026:

- **Day 1:** the Astro rebuild, the new CI pipeline, and deleting the Jekyll and al-folio files.
- **Day 2:** the CDK stack and the first deploy to AWS.
- **Day 3:** merging to `master`, renaming the repo, and cleaning up afterward.

The type-checked content collections caught problems early. Every post's front matter is validated against a schema, so a typo fails the build instead of quietly breaking a page.

## What Broke

### Every request returned a 503

CloudFront Functions run on a restricted JavaScript runtime, not Node. The runtime I used, `cloudfront-js-2.0`, doesn't support `for...of` loops. My redirect function had one, and the syntax error meant every request through CloudFront failed with a 503. Rewriting the loop with `forEach` fixed it. I also learned the source has to be plain ASCII, because CloudFront doesn't preserve other characters.

### Renaming the repo broke the deploy

The deploy role trusted tokens whose subject named the repository: `repo:billythemoose/billythemoose.github.io:ref:refs/heads/master`. After the rename, GitHub issued tokens with an immutable subject made of numeric IDs, `repo:owner@<ownerId>/repo@<repoId>:...`. They no longer matched, so AWS rejected the next deploy.

The fix was better than the original. The role now trusts the IDs, and the CDK stack refuses to build if it's given a plain `owner/repo` name. IDs survive renames, and they close a gap I hadn't thought about: if I renamed a repository and someone else created a new one with the old name, a name-based trust policy would let *their* workflows assume my role.

### Dependabot and a hidden version pin

Dependabot opened a PR to update `satteri`, the Markdown parser Astro 7 uses, from 0.10 to 0.11. It failed the type check. Astro's integration package pins satteri 0.10 internally, so the update would have installed two copies: 0.11 for my code and 0.10 for Astro. My one custom Markdown plugin, which stripped HTML comments, was built against the wrong one.

The obvious fix was to tell Dependabot to ignore satteri until Astro caught up. The better fix was to ask why the dependency was even necessary. The answer was that one plugin. It existed for one commented-out draft paragraph on my About page. I deleted the draft, the plugin and the dependency. Now satteri comes in only through Astro and always matches its version.

A smaller one along the same lines: TypeScript 6 deprecates the `baseUrl` compiler option, and `astro check` doesn't report it, but plain `tsc` does. I fixed it during the TypeScript 6 upgrade, which also clears the way for TypeScript 7 once Astro's tooling supports it.

## Result

| | Before (Jekyll on GitHub Pages) | After (Astro on AWS) |
|---|---|---|
| Build toolchain | Ruby, Python, Node, ImageMagick | Node |
| Scripts and stylesheets on the home page | 24 files from 7 hosts | 1 stylesheet + 3 small inline scripts, all self-hosted |
| CSS + JS on the home page (gzipped) | ~513 KB (42 KB CSS, 471 KB JS) | ~28 KB (27 KB CSS, 0.5 KB JS) |
| Third-party hosts contacted | 6 | 0 |
| Domain | `billythemoose.github.io` | `ineedmoreinformation.com` |
| Deploy | push to `gh-pages` | push to `master`, ~45 s to live |
| URLs preserved | n/a | 12 of 12 |
| Hosting cost | free | about $2/month, mostly the domain |


## Going forward

What's next is the reason for most of these decisions: demos on subdomains, each with its own repository and deploy role, linked from the [projects page](/projects/). The full architecture and deployment details for this site are on its [project page](/projects/portfolio-site/).
