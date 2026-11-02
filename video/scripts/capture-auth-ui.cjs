const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, '..', 'public', 'real-ui');

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  // Log in as seller@silicon.ph
  console.log('Logging in as seller@silicon.ph...');
  await page.goto('http://127.0.0.1:8090/login', { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[name="email"], input[type="text"]');
  await page.type('input[name="email"], input[type="text"]', 'seller@silicon.ph');
  await page.type('input[name="password"]', 'Password123!');
  await page.click('form button');
  await new Promise(r => setTimeout(r, 2000));
  console.log('Logged in successfully. URL is:', page.url());

  const pagesToCapture = [
    { name: '01_home_hero.png', url: 'http://127.0.0.1:8090/', scroll: 0 },
    { name: '02_home_featured.png', url: 'http://127.0.0.1:8090/', scroll: 800 },
    { name: '03_marketplace_catalog.png', url: 'http://127.0.0.1:8090/marketplace', scroll: 0 },
    { name: '04_marketplace_filters.png', url: 'http://127.0.0.1:8090/marketplace?category=Donor+boards&brand=Apple', scroll: 350 },
    { name: '05_part_detail.png', url: 'http://127.0.0.1:8090/parts/1', scroll: 0 },
    { name: '06_part_detail_scroll.png', url: 'http://127.0.0.1:8090/parts/1', scroll: 450 },
    { name: '07_sell_page.png', url: 'http://127.0.0.1:8090/sell', scroll: 0 },
    { name: '08_workspace.png', url: 'http://127.0.0.1:8090/workspace', scroll: 0 },
    { name: '09_workspace_orders.png', url: 'http://127.0.0.1:8090/workspace', scroll: 550 },
    { name: '10_order_details.png', url: 'http://127.0.0.1:8090/orders/1', scroll: 0 },
    { name: '11_bulk_scrap.png', url: 'http://127.0.0.1:8090/marketplace?category=Bulk+lots', scroll: 250 },
    { name: '12_how_it_works.png', url: 'http://127.0.0.1:8090/how-it-works', scroll: 0 }
  ];

  for (const item of pagesToCapture) {
    console.log(`Capturing: ${item.name} (${item.url})`);
    await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 15000 });
    if (item.scroll) {
      await page.evaluate((y) => window.scrollTo(0, y), item.scroll);
    }
    await new Promise(r => setTimeout(r, 1200));
    const dest = path.join(OUT_DIR, item.name);
    await page.screenshot({ path: dest });
    console.log(`Saved: ${item.name}`);
  }

  await browser.close();
  console.log('ALL AUTHENTICATED REAL UI SCREENSHOTS SAVED!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
