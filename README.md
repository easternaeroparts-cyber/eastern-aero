# Eastern Aero Website

Modern static website for **Eastern Aero** — ready to deploy on GitHub Pages.

---

## How to Host on GitHub Pages

### Step 1 — Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in (create a free account if needed).
2. Click the **+** icon (top right) → **New repository**.
3. Name it: `eastern-aero-website` (or any name you like).
4. Set it to **Public**.
5. Click **Create repository**.

---

### Step 2 — Upload the Website Files

**Option A — Upload via GitHub website (easiest):**

1. Open your new repository on GitHub.
2. Click **Add file** → **Upload files**.
3. Drag and drop the entire contents of this folder:
   - `index.html`
   - `css/` folder
   - `js/` folder
4. Click **Commit changes**.

**Option B — Using Git (command line):**

```bash
git init
git add .
git commit -m "Initial commit — Eastern Aero website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/eastern-aero-website.git
git push -u origin main
```

---

### Step 3 — Enable GitHub Pages

1. In your repository, click **Settings** (top menu).
2. Scroll down to **Pages** in the left sidebar.
3. Under **Source**, select **Deploy from a branch**.
4. Set Branch to **main** and folder to **/ (root)**.
5. Click **Save**.

---

### Step 4 — Access Your Live Website

After a minute or two, your site will be live at:

```
https://YOUR-USERNAME.github.io/eastern-aero-website/
```

GitHub will show the link in **Settings → Pages** once it's ready.

---

## Custom Domain (Optional)

If you want to use your own domain (e.g., `eastern-aero.com`):

1. In **Settings → Pages**, enter your domain in the **Custom domain** field.
2. At your domain registrar (GoDaddy, Namecheap, etc.), add these DNS records:

| Type | Name | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | YOUR-USERNAME.github.io |

3. Wait up to 24 hours for DNS to propagate.
4. Check **Enforce HTTPS** in GitHub Pages settings.

---

## File Structure

```
eastern-aero-website/
├── index.html       ← Main page
├── css/
│   └── styles.css   ← All styles
├── js/
│   └── main.js      ← Interactions & animations
└── README.md        ← This file
```

---

## Website Sections

- **Hero** — Full-width banner with animated stats counters
- **Trust Bar** — Key credentials (FAA compliance, AOG, certifications)
- **About** — Company mission and key differentiators
- **Services** — Global Sourcing, Exchange & Loan, Inventory, Repair Management
- **Fleet Support** — 12 supported aircraft/engine platforms
- **Why Eastern Aero** — 6 value proposition cards
- **Contact** — Form + all contact details and office locations
- **Footer** — Navigation, emails, copyright
