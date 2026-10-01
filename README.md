# Twisha Mehta — Portfolio

A single-page personal site that opens with a jigsaw-puzzle animation
assembling into a beach photo, then reveals a greeting. "Home", "About",
"Work", and "Contact" in the nav are anchor links to sections further down
the same page — clicking one scrolls you there, and clicking "Home" (or the
name in the top-left) scrolls back to the top.

The top-left corner reads "Home" and scrolls back to the top, same as the
"Home" link in the nav.

It's one page on purpose: separate pages (e.g. a standalone about.html)
don't work inside Claude's in-chat preview, since that preview can only host
a single self-contained file. Anchor sections work everywhere — in the
preview, opened locally, and once hosted on GitHub Pages — so that's what
this uses. If you'd rather have true separate pages (About at its own URL,
etc.) once this is live on GitHub Pages, say so and it can be split apart
then.

## File structure

```
index.html        The whole site: hero, About, Work, Contact
css/style.css     All styles
js/puzzle.js      Generates and animates the puzzle pieces
js/nav.js         Makes the nav bar solid once you scroll past the hero
js/interactions.js  Card-click modal, the orange-heart likes counter, click-to-copy email
assets/hero.jpg   The beach photo used for the puzzle
```

## Running it locally in VS Code

No build step or install needed — it's plain HTML/CSS/JS.

1. Open this folder in VS Code.
2. Install the **Live Server** extension (if you don't have it already).
3. Right-click `index.html` → **Open with Live Server**.

Or, without an extension, just double-click `index.html` to open it in a
browser — everything works from the file system directly.

## What to edit

Everywhere you'll likely want to add your own words is marked with an
`<!-- EDIT ME -->` comment in `index.html`:

- **About** — one placeholder card ("More coming soon"). Swap in your real
  bio whenever you're ready — you can keep it as a single block of text, or
  turn it into more `.card` buttons like Work does.
- **Work** — three placeholder project cards. Duplicate a `<button
  class="card openable">` block and fill in its `data-modal-title` and
  `data-modal-body` attributes with the real project name and description —
  clicking a card opens a small modal showing that text.

Every card is clickable and opens a modal (even the placeholders — they just
say "coming soon" for now), so the page never feels dead while you're still
filling it in. Click the ✕, click outside the modal, or press Esc to close
it again.

### Likes counter

The little orange heart in the bottom-right corner is a click-to-like
counter. Each click bumps the count and saves it in the visitor's own
browser (`localStorage`), so it's per-device, not a shared/global count —
there's no backend here to total it across everyone who visits.

### Email

Your real links (email, GitHub, LinkedIn, LeetCode) are already wired up in
the Contact section. The email is a real `mailto:` link (opens a mail app),
and clicking it also copies the address to the clipboard as a fallback for
anyone without a mail app configured — a small "Copied!" note flashes next
to it.

### Swapping the puzzle photo

Replace `assets/hero.jpg` with a new image of the same file name, then open
`js/puzzle.js` and update `IMG_W` / `IMG_H` near the top to match the new
image's actual pixel dimensions (open the file's properties, or run
`file assets/hero.jpg` in a terminal, to check). The puzzle uses those
numbers to crop and align the pieces correctly.

## Putting it on GitHub

From inside this folder, in a terminal:

```bash
git init
git add .
git commit -m "Initial portfolio"
```

Then create an empty repository on GitHub (github.com → New repository —
don't initialize it with a README, since you already have one), and follow
the "push an existing repository" instructions it shows you, which will look
like:

```bash
git remote add origin https://github.com/Ctrl-Alt-Twisha/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

## Hosting it for free

Once it's on GitHub, GitHub Pages will serve it for free:

1. On the repo page: **Settings → Pages**.
2. Under "Build and deployment", set **Source** to "Deploy from a branch".
3. Set **Branch** to `main` and folder to `/ (root)`, then **Save**.
4. Your site will be live at `https://Ctrl-Alt-Twisha.github.io/YOUR-REPO-NAME/`
   within a minute or two.
