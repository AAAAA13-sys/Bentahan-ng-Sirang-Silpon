const path = require('node:path');
const { spawn } = require('node:child_process');
const { alive } = require('./runtime.cjs');

const port = 8090;
const root = path.resolve(__dirname, '..');

async function checkServer() {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await checkServer()) {
    console.log(`[+] Silicon Trading is already running locally on port ${port}.`);
    return;
  }
  console.log(`[*] Starting local server on port ${port}...`);
  const runtimeScript = path.join(__dirname, 'runtime.cjs');
  const runner = spawn(process.execPath, [runtimeScript, 'start', '--no-browser'], {
    cwd: root,
    stdio: 'inherit',
  });
  await new Promise((resolve, reject) => {
    runner.once('exit', code => (code === 0 ? resolve() : reject(new Error(`Failed with code ${code}`))));
    runner.once('error', reject);
  });
}

function openUrl(url) {
  if (process.platform === 'win32') {
    spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', `Start-Process '${url}'`], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    }).unref();
  }
}

async function startTunnel() {
  await ensureServer();

  console.log('\n[*] Creating instant 100% FREE public HTTPS link (Cloudflare Edge)...');
  console.log('[*] Zero credit cards, zero payment, zero signups required.\n');

  const cf = spawn('npx.cmd', ['-y', 'cloudflared', 'tunnel', '--url', `http://127.0.0.1:${port}`], {
    shell: true,
  });

  let urlDetected = false;

  cf.stderr.on('data', chunk => {
    const text = chunk.toString();
    const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match && !urlDetected) {
      urlDetected = true;
      const publicUrl = match[0];
      console.log('====================================================================');
      console.log('           BENTAHAN NG SIRANG SILPON / SILICON TRADING              ');
      console.log('                 100% FREE PUBLIC LIVE URL                          ');
      console.log('====================================================================');
      console.log(`\n  PUBLIC LINK : ${publicUrl}\n`);
      console.log('  -> 100% Free: No credit card, no sign-up, no payment.');
      console.log('  -> Accessible globally on any phone, tablet, or laptop.');
      console.log('  -> Keep this window OPEN to keep the public link active.');
      console.log('====================================================================\n');
      openUrl(publicUrl);
    }
  });

  cf.on('exit', code => {
    console.log(`Tunnel closed (code ${code}).`);
  });
}

startTunnel().catch(err => {
  console.error('[!] Error starting tunnel:', err.message);
  process.exit(1);
});
