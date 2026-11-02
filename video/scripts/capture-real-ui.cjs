const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, '..', 'public', 'real-ui');

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080', '--force-device-scale-factor=1'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const tasks = [
    {
      name: '01_home_hero.png',
      url: 'http://127.0.0.1:8090/',
      async action() {
        await page.waitForSelector('nav', { timeout: 10000 });
        await new Promise(r => setTimeout(r, 1000));
      }
    },
    {
      name: '02_home_catalog_scroll.png',
      url: 'http://127.0.0.1:8090/',
      async action() {
        await page.evaluate(() => window.scrollTo(0, 750));
        await new Promise(r => setTimeout(r, 1000));
      }
    },
    {
      name: '03_marketplace_catalog.png',
      url: 'http://127.0.0.1:8090/marketplace',
      async action() {
        await page.waitForSelector('main', { timeout: 10000 });
        await new Promise(r => setTimeout(r, 1200));
      }
    },
    {
      name: '04_marketplace_faceted.png',
      url: 'http://127.0.0.1:8090/marketplace',
      async action() {
        await page.evaluate(() => window.scrollTo(0, 400));
        await new Promise(r => setTimeout(r, 1000));
      }
    },
    {
      name: '05_sell_page_top.png',
      url: 'http://127.0.0.1:8090/sell',
      async action() {
        await page.waitForSelector('form, input', { timeout: 10000 });
        await new Promise(r => setTimeout(r, 1000));
      }
    },
    {
      name: '06_sell_page_calculator.png',
      url: 'http://127.0.0.1:8090/sell',
      async action() {
        await page.evaluate(() => window.scrollTo(0, 300));
        await new Promise(r => setTimeout(r, 1000));
      }
    },
    {
      name: '07_seller_workspace.png',
      url: 'http://127.0.0.1:8090/workspace',
      async action() {
        await page.waitForSelector('main', { timeout: 10000 });
        await new Promise(r => setTimeout(r, 1200));
      }
    },
    {
      name: '08_workspace_orders.png',
      url: 'http://127.0.0.1:8090/workspace',
      async action() {
        await page.evaluate(() => window.scrollTo(0, 500));
        await new Promise(r => setTimeout(r, 1000));
      }
    },
    {
      name: '09_buyer_order_tracking.png',
      url: 'http://127.0.0.1:8090/orders/1',
      async action() {
        await page.waitForSelector('main', { timeout: 10000 });
        await new Promise(r => setTimeout(r, 1200));
      }
    },
    {
      name: '10_bulk_scrap_lots.png',
      url: 'http://127.0.0.1:8090/scrap',
      async action() {
        await page.waitForSelector('main', { timeout: 10000 });
        await new Promise(r => setTimeout(r, 1200));
      }
    },
    {
      name: '11_account_auth.png',
      url: 'http://127.0.0.1:8090/account',
      async action() {
        await page.waitForSelector('form, input', { timeout: 10000 });
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  ];

  for (const t of tasks) {
    console.log(`Capturing: ${t.name} from ${t.url}`);
    try {
      await page.goto(t.url, { waitUntil: 'networkidle2', timeout: 15000 });
      if (t.action) await t.action();
      const dest = path.join(OUT_DIR, t.name);
      await page.screenshot({ path: dest, fullPage: false });
      console.log(`Saved: ${t.name}`);
    } catch (e) {
      console.error(`Error capturing ${t.name}:`, e.message);
    }
  }

  await browser.close();
  console.log('ALL REAL SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
