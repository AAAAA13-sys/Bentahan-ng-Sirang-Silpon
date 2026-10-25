const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const data = path.join(root, '.data');
const recordFile = path.join(data, 'runtime.json');
const lockFile = path.join(data, 'runtime.lock');
const nextCli = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const port = 8090;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function fingerprint(directory) {
  const hash = crypto.createHash('sha256');
  const inputs = ['app', 'components', 'lib', 'db', 'public', 'scripts/setup.ts', 'package.json', 'package-lock.json', 'next.config.ts', 'next.config.js', 'next.config.mjs', 'tsconfig.json', 'tailwind.config.ts', 'tailwind.config.js', 'tailwind.config.cjs', 'postcss.config.js', 'postcss.config.cjs', 'postcss.config.mjs', '.env.local'];
  function visit(relative) {
    const absolute = path.join(directory, relative);
    if (!fs.existsSync(absolute)) { hash.update(`missing:${relative}\n`); return; }
    if (fs.statSync(absolute).isDirectory()) {
      for (const name of fs.readdirSync(absolute).sort()) visit(path.join(relative, name));
    } else { hash.update(relative.replaceAll('\\', '/')); hash.update(fs.readFileSync(absolute)); }
  }
  inputs.forEach(visit);
  return hash.digest('hex');
}
function readJson(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } }
function alive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (error) { return error.code === 'EPERM'; }
}
function commandLine(pid) {
  if (!alive(pid)) return '';
  if (process.platform !== 'win32') {
    try { return fs.readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0'); } catch { return []; }
  }
  const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', `(Get-CimInstance Win32_Process -Filter "ProcessId = ${pid}").CommandLine`], { encoding: 'utf8', windowsHide: true });
  if (result.status !== 0) throw new Error('Cannot verify process identity; no process was stopped.');
  return result.stdout.trim();
}
function matchesCommand(command, script) {
  const normalize = value => process.platform === 'win32' ? value.replaceAll('/', '\\').toLowerCase() : value;
  if (Array.isArray(command)) return command.some(arg => normalize(arg) === normalize(script));
  const escaped = normalize(script).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[\\s"'])${escaped}(?=$|[\\s"'])`).test(normalize(command));
}
async function health() {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(2000) });
    const body = await response.json();
    return response.ok && body.application === 'silicon-trading' && body.stack === 'nextjs' && body.database === 'connected';
  } catch { return false; }
}
async function occupied() {
  const net = require('node:net');
  return new Promise(resolve => {
    const socket = net.connect({ host: '127.0.0.1', port });
    socket.setTimeout(1500);
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => { socket.destroy(); resolve(false); });
    socket.once('timeout', () => { socket.destroy(); resolve(true); });
  });
}
async function acquireLock() {
  fs.mkdirSync(data, { recursive: true });
  const deadline = Date.now() + 180000;
  while (true) {
    try {
      const descriptor = fs.openSync(lockFile, 'wx');
      fs.writeFileSync(descriptor, JSON.stringify({ pid: process.pid, root, script: process.argv[1] }));
      fs.closeSync(descriptor);
      return () => { if (readJson(lockFile)?.pid === process.pid) fs.unlinkSync(lockFile); };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const lock = readJson(lockFile);
      // A writer may have created the file just before writing its PID.
      let recent;
      try { recent = Date.now() - fs.statSync(lockFile).mtimeMs < 3000; }
      catch (error) { if (error.code === 'ENOENT') continue; throw error; }
      const lockOwner = lock && alive(lock.pid) && matchesCommand(commandLine(lock.pid), lock.script || __filename);
      if ((!lock && !recent) || (lock && !lockOwner)) { fs.rmSync(lockFile, { force: true }); continue; }
      if (Date.now() > deadline) throw new Error('Another launcher is still working. Wait for its window to finish.');
      await sleep(500);
    }
  }
}
function npmRun(script) {
  const npmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  const result = fs.existsSync(npmCli)
    ? spawnSync(process.execPath, [npmCli, 'run', script], { cwd: root, stdio: 'inherit', windowsHide: true })
    : spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', script], { cwd: root, stdio: 'inherit', windowsHide: true, shell: process.platform === 'win32' });
  if (result.error || result.status !== 0) throw new Error(`${script} failed. See the output above.`);
}
function openBrowser() {
  const url = `http://127.0.0.1:${port}`;
  if (process.platform === 'win32') spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', `Start-Process '${url}' -WindowStyle Hidden`], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
  console.log(`Silicon Trading is ready: ${url}`);
}
async function start(noBrowser) {
  if (await health()) { if (!noBrowser) openBrowser(); else console.log(`Ready on http://127.0.0.1:${port}`); return; }
  if (await occupied()) throw new Error(`Port ${port} is occupied by another or unhealthy application. Stop that application first; no process was killed.`);
  if (!fs.existsSync(nextCli)) throw new Error('Dependencies are missing. Install Node.js 22 or later and run npm install inside modern.');
  console.log('Preparing the database (existing records are preserved)...');
  npmRun('db:setup');
  const hash = fingerprint(root);
  const hashFile = path.join(data, 'build.json');
  if (!fs.existsSync(path.join(root, '.next', 'BUILD_ID')) || readJson(hashFile)?.hash !== hash) {
    console.log('Building Silicon Trading...');
    npmRun('build');
    fs.writeFileSync(hashFile, JSON.stringify({ hash }));
  }
  const logs = path.join(root, 'output', '.runtime');
  fs.mkdirSync(logs, { recursive: true });
  const out = fs.openSync(path.join(logs, 'server.log'), 'a');
  const err = fs.openSync(path.join(logs, 'error.log'), 'a');
  let child;
  try {
    child = spawn(process.execPath, [nextCli, 'start', '--hostname', '127.0.0.1', '--port', String(port)], { cwd: root, detached: true, windowsHide: true, stdio: ['ignore', out, err] });
    await new Promise((resolve, reject) => { child.once('spawn', resolve); child.once('error', reject); });
    fs.writeFileSync(recordFile, JSON.stringify({ pid: child.pid, port, nextCli, root }, null, 2));
    child.unref();
  } finally { fs.closeSync(out); fs.closeSync(err); }
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    if (await health()) {
      const home = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(5000) });
      if (home.status === 200) { if (!noBrowser) openBrowser(); else console.log(`Ready on http://127.0.0.1:${port}`); return; }
    }
    if (!alive(child.pid)) break;
    await sleep(500);
  }
  throw new Error(`Server did not become ready. Inspect ${logs}. Use STOP-SILICON.bat before retrying.`);
}
async function stop() {
  const record = readJson(recordFile);
  if (!record) { console.log('No recorded Silicon Trading server to stop.'); return; }
  if (record.root !== root || record.nextCli !== nextCli || record.port !== port) throw new Error('Runtime record does not belong to this installation. No process was stopped.');
  if (alive(record.pid)) {
    if (!matchesCommand(commandLine(record.pid), nextCli)) throw new Error('Recorded PID belongs to another process. No process was stopped.');
    if (process.platform === 'win32') {
      const result = spawnSync('taskkill.exe', ['/PID', String(record.pid), '/T', '/F'], { encoding: 'utf8', windowsHide: true });
      if (result.status !== 0) throw new Error('Could not stop the recorded Next.js server.');
    } else process.kill(record.pid, 'SIGTERM');
    const deadline = Date.now() + 10000;
    while (alive(record.pid) && Date.now() < deadline) await sleep(200);
    if (alive(record.pid)) throw new Error('Server is still running; runtime record retained.');
  }
  fs.unlinkSync(recordFile);
  console.log('Silicon Trading stopped.');
}
async function main() {
  if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Node.js 22 or later is required.');
  const command = process.argv[2];
  if (!['start', 'stop'].includes(command)) throw new Error('Usage: node scripts/runtime.cjs start [--no-browser] | stop');
  const release = await acquireLock();
  try { if (command === 'start') await start(process.argv.includes('--no-browser')); else await stop(); }
  finally { release(); }
}
module.exports = { fingerprint, matchesCommand, alive };
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });