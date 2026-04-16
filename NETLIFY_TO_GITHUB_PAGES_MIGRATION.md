# NETLIFY TO GITHUB PAGES -- MIGRATION HANDOFF
## Created: 2026-04-10
## Purpose: Universal migration guide for all 6 Bodhi 360 Netlify sites

---

## WHY WE ARE MIGRATING

Netlify Pro is $12.43/month, due 2026-04-25. All 6 sites are fully static -- single `index.html` files with no serverless functions, no form handling, no build pipeline, no edge functions. GitHub Pages hosts fully static sites for free with custom domains and SSL. The only feature Netlify provides that we actually use is CDN delivery and custom domain -- GitHub Pages covers both.

**Target: Cancel Netlify Pro before 2026-04-25 billing date.**

---

## WHAT IS ALREADY DONE

- **latedxaudhdguy** -- fully migrated to GitHub Pages as of 2026-04-10.
  - Repo: `https://github.com/aicontentnow/latedxaudhdguy`
  - GitHub Pages: enabled on `main` branch, root `/`
  - CNAME file: `latedxaudhdguy.com` in repo root
  - DNS: STILL pointing to Netlify -- needs update (see below)
  - Netlify site: still live at `7ab6445a-f958-4e9e-acf4-1e568a9092ad` -- do NOT delete until DNS is confirmed working on Pages

---

## ALL 6 SITES -- STATUS TABLE

| Site | Netlify Site ID | Netlify URL | Custom Domain | Deploy Folder | GitHub Repo | Status |
|------|----------------|-------------|---------------|---------------|-------------|--------|
| thebookofoneness.com | `9c504ac7-3cc9-4c0b-94b0-e2990b59a21d` | oneness.netlify.app | thebookofoneness.com | `mirror/oneness-website/public` | TBD | Not started |
| mirrorops | `20a169de-0300-429e-ae1b-4ba076b929a3` | mirrorops.netlify.app | None | `mirror/ops-dashboard` | TBD | Not started |
| bodhi-command-center | `752b83b7-1e62-41f7-8761-da2e262c533a` | bodhi-cmd.netlify.app | None | `_command-center` | TBD | Not started |
| hhh-ops-dashboard | `7408f80e-8a92-4201-9af3-482de303693a` | hhh-ops.netlify.app | None | `framezero/clients/hhh` | TBD | Not started |
| latedxaudhdguy | `7ab6445a-f958-4e9e-acf4-1e568a9092ad` | latedxaudhdguy.netlify.app | latedxaudhdguy.com | `latedxaudhd/website/public` | aicontentnow/latedxaudhdguy | **Code done -- DNS pending** |
| seasons.band | (managed separately -- already on GitHub Pages) | N/A | seasons.band | `seasons/website` | aicontentnow/seasons-band | Already migrated |

---

## MIGRATION RECIPE (per site)

Run this once per site. All commands assume Desktop Commander `start_process` on the Mac.

### Step 1 -- Create the GitHub repo

```bash
gh repo create aicontentnow/[REPO-NAME] --public --description "[site description]"
```

### Step 2 -- Add CNAME file (only for sites with custom domains)

Create a file called `CNAME` in the deploy folder root with just the domain name on one line:

```
thecustomdomain.com
```

No `https://`, no trailing slash.

### Step 3 -- Initialize git and push

```bash
cd "/Users/bodhivalentine/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/[DEPLOY-FOLDER]"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/aicontentnow/[REPO-NAME].git
git push -u origin main
```

If the folder already has a `.git` directory (was previously initialized), skip `git init` and instead:

```bash
git remote add origin https://github.com/aicontentnow/[REPO-NAME].git
git push -u origin main
```

### Step 4 -- Enable GitHub Pages

```bash
gh api repos/aicontentnow/[REPO-NAME]/pages --method POST --field 'source[branch]=main' --field 'source[path]=/'
```

Confirm the response includes `"status": null` or `"status": "built"` and the correct `cname` value.

### Step 5 -- Verify the Pages URL

Wait 1-2 minutes, then check:

```
https://aicontentnow.github.io/[REPO-NAME]/
```

The site should be live there before touching DNS.

### Step 6 -- Update DNS in Spaceship (only for custom domain sites)

**Log into Spaceship** at app.spaceship.com. For each domain with a custom domain:

Remove the existing Netlify A record (usually `75.2.60.5` or similar) and add these 4 GitHub Pages A records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |

Update the CNAME for `www`:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | www | aicontentnow.github.io | 3600 |

**DNS propagation takes 1-48 hours.** The GitHub Pages HTTPS cert provisions automatically once DNS resolves correctly.

### Step 7 -- Verify HTTPS is working

Once DNS propagates, check:

```bash
gh api repos/aicontentnow/[REPO-NAME]/pages
```

Look for `"https_enforced": true` and `"status": "built"`.

Then enforce HTTPS:

```bash
gh api repos/aicontentnow/[REPO-NAME]/pages --method PUT --field https_enforced=true
```

### Step 8 -- Confirm and delete from Netlify

Only after the custom domain is loading correctly via HTTPS on GitHub Pages:

1. Log into Netlify at app.netlify.com
2. Navigate to the site
3. Go to Site Settings > General > Danger Zone
4. Click "Delete this site"
5. Mark that site as deleted in the table above

**Do NOT delete the Netlify site until the custom domain is confirmed working on Pages.**

---

## LATEDXAUDHDGUY -- REMAINING DNS STEP

The code is done and Pages is enabled. The only remaining step for latedxaudhdguy.com is the Spaceship DNS update.

**Current DNS (Netlify):** A record pointing to `75.2.60.5` (or the Netlify load balancer IP)
**Target DNS (GitHub Pages):** 4 A records as listed above + CNAME www -> aicontentnow.github.io

Once you update DNS in Spaceship, the site will serve from GitHub Pages. After HTTPS provisions (~24hrs), enforce it and delete from Netlify.

---

## SITES WITH NO CUSTOM DOMAIN

For mirrorops, bodhi-command-center, and hhh-ops-dashboard -- these have no custom domain, so they will move from:

- `sitename.netlify.app`

to:

- `aicontentnow.github.io/[repo-name]/`

These are internal dashboards. Update any bookmarks or links that reference the Netlify URL after migrating.

---

## NOTES FOR THE AI AGENT RUNNING THIS

- Home directory is `/Users/bodhivalentine` -- never `/Users/bodhi`
- GitHub auth token is available in the shell -- `gh` CLI is already authenticated as `aicontentnow`
- All deploy folders are under `~/Library/Mobile Documents/com~apple~CloudDocs/Claude-Workspace/`
- Paths with spaces need quotes in shell commands
- Do NOT destroy anything until confirmed working. Migrate, verify, then delete.
- HTTPS enforcement will return a 404 error until DNS propagates -- this is normal, retry after 24hrs

---

## CANCELLATION CHECKLIST

Before cancelling Netlify Pro:

- [ ] latedxaudhdguy.com confirmed on GitHub Pages (DNS pending)
- [ ] thebookofoneness.com confirmed on GitHub Pages
- [ ] mirrorops migrated to aicontentnow.github.io/mirrorops
- [ ] bodhi-command-center migrated to aicontentnow.github.io/bodhi-command-center
- [ ] hhh-ops-dashboard migrated to aicontentnow.github.io/hhh-ops
- [ ] All Netlify sites deleted
- [ ] Netlify subscription cancelled in Account Settings > Billing
- [ ] $12.43/month removed from `_command-center/expenses.md`

---

*Netlify Pro renewal date: 2026-04-25. Complete all migrations before that date.*
