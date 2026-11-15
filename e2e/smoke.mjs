// Kouřový test celé hry v prohlížeči: založení hráče, odehrání kol, stromeček, rodičovská zóna.
// Spuštění: npm run build && npm run e2e   (používá předinstalovaný Playwright)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const SHOTS = process.env.SHOTS; // volitelně složka pro snímky obrazovky
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const PORT = 4179;
const server = spawn('node_modules/.bin/vite', ['preview', '--port', String(PORT), '--strictPort'], { stdio: 'pipe' });
await new Promise((res, rej) => {
  server.stdout.on('data', (d) => String(d).includes(String(PORT)) && res());
  server.on('exit', () => rej(new Error('preview server exited')));
  setTimeout(() => rej(new Error('preview server timeout')), 15000);
});

const errors = [];
const browser = await chromium.launch();
console.log('server up');
const shot = async (page, name) => SHOTS && page.screenshot({ path: `${SHOTS}/${name}.png` });

async function passGate(page) {
  const hold = page.locator('.hold-btn');
  await hold.hover();
  await page.mouse.down();
  await page.waitForTimeout(3200);
  await page.mouse.up();
  const q = await page.locator('.gate h2').textContent();
  const [, a, b] = q.match(/(\d+) × (\d+)/);
  for (const d of String(Number(a) * Number(b))) await page.click(`.keypad [data-n="${d}"]`);
  await page.click('.keypad .ok');
}

async function playRound(page, idx, prefix) {
  await page.waitForSelector('.screen-game .slot');
  await page.waitForTimeout(500);
  await shot(page, `${prefix}-round${idx}`);
  for (let attempt = 0; attempt < 40; attempt++) {
    if (await page.locator('.overlay:not(.hidden) [data-action=next]').count()) break;
    const slots = page.locator('.slot:not(.fade)');
    const n = await slots.count();
    await slots.nth(attempt % n).click();
    await page.waitForTimeout(150);
  }
  await page.waitForSelector('.overlay:not(.hidden) [data-action=next]', { timeout: 5000 });
  await shot(page, `${prefix}-reward${idx}`);
  await page.click('[data-action=next]');
}

async function run(name, ctxOpts) {
  const log = (m) => console.log(`[${name}] ${m}`);
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`${name}: ${m.text()}`));
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForSelector('.screen-home');
  await shot(page, `${name}-0-home-empty`);

  // Přidat dva hráče přes rodičovský zámek
  log('home');
  await page.click('[data-action=add]');
  await passGate(page);
  await page.fill('input[name=name]', 'Anička');
  await page.selectOption('select[name=level]', '1');
  await page.selectOption('select[name=textMode]', 'shown');
  await shot(page, `${name}-1-parent-form`);
  await page.click('[data-action=saveProfile]');
  await page.click('[data-action=edit][data-id=new]');
  await page.fill('input[name=name]', 'Bára');
  await page.click('.avatars label:nth-child(4)');
  await page.click('[data-action=saveProfile]');
  await page.click('[data-action=tab][data-tab=voice]');
  await page.waitForSelector('.phrase');
  await shot(page, `${name}-2-parent-voice`);
  await page.click('[data-action=exit]');

  await page.waitForSelector('.profile-card');
  await shot(page, `${name}-3-home`);
  log('profiles created');
  await page.click('.profile-card >> nth=0');
  await page.waitForSelector('.helper-card');
  await page.click('.helper-card[data-id=deer]');
  await shot(page, `${name}-4-helper`);
  await page.click('[data-action=play]');

  for (let i = 0; i < 5; i++) {
    await playRound(page, i, name);
    log(`round ${i} done`);
    if (i < 4) {
      await page.waitForSelector('.helper-card.selected[data-id=deer]');
      await page.click('[data-action=play]');
    }
  }
  await page.waitForSelector('.screen-results');
  await page.waitForTimeout(800);
  await shot(page, `${name}-5-results`);
  await page.click('[data-action=tree]');
  await page.waitForSelector('.tray-item');
  // Umístit všechny dostupné ozdoby
  for (let k = 0; k < 10; k++) {
    const item = page.locator('button.tray-item').first();
    if (!(await item.count())) break;
    await item.click();
    const box = await page.locator('.tree-svg').boundingBox();
    await page.mouse.click(box.x + box.width * (0.35 + 0.1 * (k % 3)), box.y + box.height * (0.45 + 0.08 * (k % 4)));
    await page.waitForTimeout(100);
  }
  const placed = await page.locator('.deco').count();
  if (placed < 1) errors.push(`${name}: na stromečku není žádná ozdoba`);
  await shot(page, `${name}-6-tree`);

  // Stav se uloží a přežije obnovení stránky
  await page.waitForTimeout(400);
  await page.reload();
  await page.waitForSelector('.profile-card');
  const stars = await page.locator('.profile-card .pstars').first().textContent();
  if (!/★ ([5-9]|1\d)/.test(stars)) errors.push(`${name}: hvězdičky se neuložily (${stars})`);
  await ctx.close();
  return { placed, stars };
}

try {
  console.log('tablet', await run('tablet', { ...devices['iPad (gen 7) landscape'] }));
  console.log('phone', await run('phone', { ...devices['Pixel 7'] }));
} catch (e) {
  errors.push(String(e.stack || e));
} finally {
  await browser.close();
  server.kill();
}

if (errors.length) {
  console.error('CHYBY:\n' + errors.join('\n'));
  process.exit(1);
}
console.log('OK');
process.exit(0);
