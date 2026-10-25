const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { fingerprint, matchesCommand, alive } = require('../scripts/runtime.cjs');

test('source changes and removed files invalidate a production build; runtime data does not', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'silicon-runtime-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'app'));
  fs.writeFileSync(path.join(root, 'app', 'page.tsx'), 'original');
  const original = fingerprint(root);
  fs.mkdirSync(path.join(root, '.data'));
  fs.writeFileSync(path.join(root, '.data', 'runtime.json'), 'running');
  fs.mkdirSync(path.join(root, '.next'));
  fs.writeFileSync(path.join(root, '.next', 'BUILD_ID'), 'generated');
  assert.equal(fingerprint(root), original);
  fs.writeFileSync(path.join(root, 'app', 'page.tsx'), 'changed');
  assert.notEqual(fingerprint(root), original);
  const changed = fingerprint(root);
  fs.unlinkSync(path.join(root, 'app', 'page.tsx'));
  assert.notEqual(fingerprint(root), changed);
});

test('stop process identity requires the exact Next CLI argument', () => {
  const cli = path.resolve('modern/node_modules/next/dist/bin/next');
  assert.equal(matchesCommand(`"node" "${cli}" start`, cli), true);
  assert.equal(matchesCommand(`"node" "${cli}-other" start`, cli), false);
  assert.equal(matchesCommand(`"node" "prefix${cli}" start`, cli), false);
  assert.equal(matchesCommand(['node', cli, 'start'], cli), true);
  assert.equal(matchesCommand(['node', `${cli}-other`], cli), false);
});

test('invalid process records cannot target operating-system process groups', () => {
  assert.equal(alive(0), false);
  assert.equal(alive(-1), false);
  assert.equal(alive('123'), false);
  assert.equal(alive(process.pid), true);
});
test('CommonJS build configuration changes invalidate a production build', t => {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'silicon-config-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 for (const filename of ['tailwind.config.cjs','postcss.config.cjs']) {
  const before=fingerprint(root); fs.writeFileSync(path.join(root,filename),'module.exports = {}');
  assert.notEqual(fingerprint(root),before);
  const added=fingerprint(root); fs.writeFileSync(path.join(root,filename),'module.exports = { changed: true }');
  assert.notEqual(fingerprint(root),added);
 }
});
