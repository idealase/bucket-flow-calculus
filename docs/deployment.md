# Deployment Guide: GitHub Pages

## 1. Overview

This document describes how to deploy the Bucket Flow Calculus simulator to GitHub Pages.

**Target URL**: `https://<username>.github.io/bucket-flow-calculus/`

---

## 2. Build Configuration

### 2.1 Base Path

Since GitHub Pages hosts at a subpath (`/bucket-flow-calculus/`), the app must be configured with the correct base path.

**Chosen Approach**: Static base path in `vite.config.ts`

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/bucket-flow-calculus/',
})
```

**Why this approach**:
- Simple and predictable
- No runtime environment detection needed
- Works correctly for both dev and production

**Implications**:
- Local `npm run dev` works at `http://localhost:5173/bucket-flow-calculus/`
- Local `npm run preview` works at `http://localhost:4173/bucket-flow-calculus/`
- Production works at `https://<user>.github.io/bucket-flow-calculus/`

### 2.2 Alternative: Dynamic Base Path

If you need different base paths for different environments:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/bucket-flow-calculus/' : '/',
})
```

This allows local dev at root (`/`) while production uses the subpath. Not used in this project for simplicity.

---

## 3. Build Process

### 3.1 Local Build

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

### 3.2 Build Output

The `npm run build` command outputs to `dist/`:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── vite.svg (if present)
```

---

## 4. GitHub Actions Workflow

### 4.1 Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 4.2 Workflow Explanation

| Step | Action | Purpose |
|------|--------|---------|
| Checkout | `actions/checkout@v4` | Clone the repository |
| Setup Node | `actions/setup-node@v4` | Install Node.js LTS with npm cache |
| Install deps | `npm ci` | Clean install from lockfile |
| Build | `npm run build` | Create production bundle |
| Setup Pages | `actions/configure-pages@v4` | Configure GitHub Pages |
| Upload artifact | `actions/upload-pages-artifact@v3` | Upload `dist/` for deployment |
| Deploy | `actions/deploy-pages@v4` | Publish to GitHub Pages |

---

## 5. GitHub Repository Settings

### 5.1 Enable GitHub Pages

1. Go to repository **Settings**
2. Navigate to **Pages** (left sidebar, under "Code and automation")
3. Under **Source**, select **GitHub Actions**
4. Save

### 5.2 First Deployment

After enabling Pages and pushing to `main`:

1. GitHub Actions workflow triggers automatically
2. Build job runs (~1-2 minutes)
3. Deploy job publishes to Pages
4. Site available at `https://<username>.github.io/bucket-flow-calculus/`

### 5.3 Verify Deployment

Check the **Actions** tab in your repository:
- Green checkmark = successful deployment
- Click on the workflow run for details
- The deploy job shows the deployment URL

---

## 6. Troubleshooting

### 6.1 404 on Page Load

**Symptoms**: Blank page or 404 error at the deployed URL

**Causes and Fixes**:

| Cause | Fix |
|-------|-----|
| Base path not set | Ensure `base: '/bucket-flow-calculus/'` in `vite.config.ts` |
| Wrong branch | Ensure workflow triggers on `main` branch |
| Pages not enabled | Enable GitHub Pages in repository settings |
| Wrong source | Select "GitHub Actions" as Pages source |

### 6.2 Assets Not Loading

**Symptoms**: HTML loads but JS/CSS fails

**Causes and Fixes**:

| Cause | Fix |
|-------|-----|
| Base path mismatch | Check browser DevTools Network tab for asset URLs |
| Mixed content | Ensure all URLs use HTTPS |

### 6.3 Workflow Fails

**Symptoms**: Red X in Actions tab

**Debug Steps**:
1. Click on the failed workflow run
2. Expand the failed step
3. Read the error message
4. Common issues:
   - `npm ci` fails: Check `package-lock.json` is committed
   - Build fails: Run `npm run build` locally to reproduce

### 6.4 Old Version Cached

**Symptoms**: Changes don't appear after deployment

**Fixes**:
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- Wait a few minutes for CDN propagation

---

## 7. Local Development

### 7.1 Running Locally

```bash
# Clone the repository
git clone https://github.com/<username>/bucket-flow-calculus.git
cd bucket-flow-calculus

# Install dependencies
npm install

# Start development server
npm run dev
```

Development server runs at `http://localhost:5173/bucket-flow-calculus/`

### 7.2 Testing Production Build

```bash
# Build for production
npm run build

# Preview the build
npm run preview
```

Preview server runs at `http://localhost:4173/bucket-flow-calculus/`

---

## 8. Custom Domain (Out of Scope)

Custom domains are not covered in this MVP. If needed later:

1. Add a `CNAME` file to `public/` with your domain
2. Configure DNS to point to GitHub Pages
3. Enable custom domain in repository settings
4. Update `base` path accordingly (may need to be `/`)

---

## 9. Security Considerations

### 9.1 Static Site Security

This is a fully static, client-side application:
- No server-side code
- No API keys or secrets
- No user authentication
- No data persistence

### 9.2 HTTPS

GitHub Pages automatically serves over HTTPS. No additional configuration needed.

---

## 10. Maintenance

### 10.1 Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Test locally before pushing
npm run build
npm run preview
```

### 10.2 Monitoring Deployments

- Check Actions tab for deployment history
- GitHub sends email notifications on workflow failures (if enabled)
