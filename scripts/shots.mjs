#!/usr/bin/env node
/**
 * Regenerate the README screenshots from a local build.
 *
 *   npm run build
 *   npm run preview            # serves dist/ on http://127.0.0.1:4173
 *   node scripts/shots.mjs     # writes docs/screenshot*.png
 *
 * Override the browser binary with BROWSER=/path/to/chrome (Edge/Chrome both work).
 * Override the served URL with BASE_URL=http://127.0.0.1:4173/.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const CANDIDATES = [
  process.env.BROWSER,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

const browser = CANDIDATES.find((p) => {
  try {
    execFileSync(p, ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
});

if (!browser) {
  console.error("No Chromium-family browser found. Set BROWSER=/path/to/chrome.");
  process.exit(1);
}

const base = process.env.BASE_URL ?? "http://127.0.0.1:4173/";
const outDir = process.argv[2] ?? "docs";
mkdirSync(outDir, { recursive: true });

const shots = [
  { name: "screenshot.png", size: "1280,800" },
  { name: "screenshot-mobile.png", size: "390,844" },
];

for (const s of shots) {
  const out = join(outDir, s.name).replace(/\\/g, "/");
  execFileSync(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=2",
      `--window-size=${s.size}`,
      `--screenshot=${out}`,
      "--virtual-time-budget=4000",
      base,
    ],
    { stdio: "ignore" },
  );
  console.log("wrote", out);
}
