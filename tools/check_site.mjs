// Interaction check for the site at desktop and mobile widths.
// Opens the home page, clicks the theme toggle, opens the mobile menu, opens the publications
// page, clicks a bib toggle, a "more authors" control and a preview image (zoom), opens search,
// screenshots every state and fails on console errors, 4xx/5xx responses or missing controls.
// Usage: node tools/check_site.mjs <base-url> <out-dir>
// Needs the playwright package (npm ci, or npm i --no-save playwright) and a Chromium build
// (npx playwright install chromium).
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const [baseArg, outDir] = process.argv.slice(2);
if (!baseArg || !outDir) {
  console.error("usage: node tools/check_site.mjs <base-url> <out-dir>");
  process.exit(2);
}
const base = baseArg.replace(/\/$/, "");
mkdirSync(outDir, { recursive: true });

const controls = {
  themeToggle: ["#light-toggle", "button[aria-label*='theme' i]", "a[aria-label*='theme' i]", ".theme-toggle"],
  mobileMenu: [".navbar-toggler", "button[aria-controls*='navbar' i]", "button[aria-label*='menu' i]", "button[aria-label*='navigation' i]"],
  bibToggle: [".bibtex.btn", "a.bibtex", "button.bibtex", "[data-toggle='collapse'][href*='bib']", "button:has-text('Bib')", "a:has-text('Bib')"],
  moreAuthors: [".more-authors", "[aria-label*='more authors' i]", "button:has-text('more authors')", "a:has-text('more authors')"],
  zoom: ["img.zoomable", ".preview img", ".publications img", "figure img"],
  search: ["#search-toggle", "button[aria-label*='search' i]", "a[aria-label*='search' i]", ".search-toggle"],
};

const problems = [];
const browser = await chromium.launch();

async function firstVisible(page, candidates) {
  for (const sel of candidates) {
    const loc = page.locator(sel).first();
    if ((await loc.count()) && (await loc.isVisible().catch(() => false))) return { sel, loc };
  }
  return null;
}

async function tryClick(page, label, name, candidates, shot) {
  const hit = await firstVisible(page, candidates);
  if (!hit) {
    problems.push(`${label}: ${name} control not found (tried ${candidates.join(", ")})`);
    return false;
  }
  await hit.loc.click({ timeout: 5000 }).catch((e) => problems.push(`${label}: ${name} click failed: ${e.message}`));
  await page.waitForTimeout(500);
  await shot(name);
  return true;
}

async function run(width, label) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`${label}: console error: ${m.text()}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400) problems.push(`${label}: ${r.status()} ${r.url()}`);
  });
  const shot = (name) => page.screenshot({ path: join(outDir, `${label}-${name}.png`), fullPage: true });

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await shot("home");
  await tryClick(page, label, "theme-toggled", controls.themeToggle, shot);
  if (width < 768) await tryClick(page, label, "menu-open", controls.mobileMenu, shot);

  await page.goto(`${base}/publications/`, { waitUntil: "networkidle" });
  await shot("publications");
  await tryClick(page, label, "bib-open", controls.bibToggle, shot);
  const more = await firstVisible(page, controls.moreAuthors);
  if (more) await tryClick(page, label, "more-authors", controls.moreAuthors, shot);
  await tryClick(page, label, "zoom", controls.zoom, shot);
  await page.keyboard.press("Escape");

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const searchHit = await firstVisible(page, controls.search);
  if (searchHit) {
    await tryClick(page, label, "search-open", controls.search, shot);
  } else {
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(500);
    await shot("search-shortcut");
  }

  await page.goto(`${base}/cv/`, { waitUntil: "networkidle" });
  await shot("cv");
  await context.close();
}

await run(1280, "desktop");
await run(390, "mobile");
await browser.close();

if (problems.length) {
  console.log("PROBLEMS:");
  for (const p of problems) console.log(" - " + p);
  console.log(`CHECK FAIL ${base} (${problems.length} problems)`);
  process.exit(1);
}
console.log(`CHECK PASS ${base}`);
