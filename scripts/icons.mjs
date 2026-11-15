// Vytvoří PNG ikony z public/icon.svg (spustit jednou: node scripts/icons.mjs).
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // předinstalovaný Playwright (NODE_PATH)
import { readFileSync } from 'node:fs';

const svg = readFileSync(new URL('../public/icon.svg', import.meta.url), 'utf8');
const browser = await chromium.launch();
for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<style>html,body{margin:0}svg{width:${size}px;height:${size}px;display:block}</style>${svg}`);
  await page.screenshot({ path: new URL(`../public/icon-${size}.png`, import.meta.url).pathname });
  await page.close();
}
await browser.close();
