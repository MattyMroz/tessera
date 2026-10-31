import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { filesIn, packageDir } from './helpers'

const probe = String.raw`
  import assert from 'node:assert/strict';
  const settle = globalThis.setImmediate;
  const effects = [];
  const record = (name) => () => { effects.push(name); return 0; };
  const owners = [['globalThis', globalThis], ...Object.getOwnPropertyNames(globalThis).flatMap((name) => {
    const value = Object.getOwnPropertyDescriptor(globalThis, name)?.value;
    return typeof value === 'function' && value.prototype ? [[name + '.prototype', value.prototype]] : [];
  })];
  const dom = new Proxy(function () {}, {
    get: () => dom,
    set: (_, key) => { effects.push('DOM write: ' + String(key)); return true; },
    apply: () => { effects.push('DOM call'); return dom; },
    construct: () => { effects.push('DOM construct'); return dom; },
  });
  const storage = new Proxy({
    getItem: record('storage.getItem'), key: () => null, length: 0,
    setItem: record('storage.setItem'), removeItem: record('storage.removeItem'), clear: record('storage.clear'),
  }, {
    set: (_, key) => { effects.push('storage write: ' + String(key)); return true; },
    deleteProperty: (_, key) => { effects.push('storage delete: ' + String(key)); return true; },
    defineProperty: (_, key) => { effects.push('storage define: ' + String(key)); return true; },
  });
  globalThis.document = dom;
  globalThis.window = globalThis;
  globalThis.self = globalThis;
  for (const name of ['localStorage', 'sessionStorage']) {
    Object.defineProperty(globalThis, name, { configurable: true, value: storage });
  }
  for (const name of ['setTimeout', 'setInterval', 'setImmediate',
    'requestAnimationFrame', 'requestIdleCallback', 'queueMicrotask']) {
    globalThis[name] = record(name);
  }
  const listeners = new Map();
  const add = (type, fn) => listeners.set(fn, type);
  const remove = (_, fn) => listeners.delete(fn);
  globalThis.addEventListener = add;
  globalThis.removeEventListener = remove;
  EventTarget.prototype.addEventListener = add;
  EventTarget.prototype.removeEventListener = remove;
  globalThis.matchMedia = () => { effects.push('matchMedia'); return { matches: false,
    addEventListener: record('media.addEventListener'), addListener: record('media.addListener') }; };
  const snapshot = () => new Map(owners.flatMap(([name, owner]) => Reflect.ownKeys(owner).map((key) => {
    const { value, get, set } = Object.getOwnPropertyDescriptor(owner, key);
    return [name + '.' + String(key), [value, get, set]];
  })));
  const before = snapshot();
  await import(process.argv[1]);
  await new Promise(settle);
  const after = snapshot();
  for (const key of new Set([...before.keys(), ...after.keys()])) {
    const [was, is] = [before.get(key), after.get(key)];
    if (!was || !is || was.some((part, index) => !Object.is(part, is[index]))) effects.push('global: ' + key);
  }
  for (const type of listeners.values()) effects.push('listener: ' + type);
  assert.deepEqual(effects, []);
`

function importInProbe(file: string): { status: number | null; output: string } {
  const result = spawnSync('node', ['--input-type=module', '--eval', probe, pathToFileURL(file).href], {
    cwd: packageDir, encoding: 'utf8', timeout: 10_000,
  })
  expect(result.error).toBeUndefined()
  return { status: result.status, output: result.stdout + result.stderr }
}

const modules = filesIn(resolve(packageDir, 'dist'), /\.js$/)

const leaks: Record<string, string> = {
  'dom-write.js': "document.title = 'leak'",
  'dom-call.js': "document.createElement('style')",
  'timer.js': 'setTimeout(() => {}, 0)',
  'microtask.js': 'queueMicrotask(() => {})',
  'listener.js': "addEventListener('resize', () => {})",
  'storage.js': "localStorage.setItem('key', 'value')",
  'media.js': "matchMedia('(prefers-color-scheme: dark)')",
  'global.js': 'globalThis.leak = 1',
  'hidden-global.js': "Object.defineProperty(globalThis, 'leak', { value: 1 })",
  'replaced-global.js': 'globalThis.fetch = () => {}',
  'prototype.js': 'Array.prototype.leak = 1',
}

let leakDir = ''

beforeAll(() => {
  leakDir = mkdtempSync(resolve(tmpdir(), 'tessera-side-effects-'))
  for (const [name, code] of Object.entries(leaks)) writeFileSync(resolve(leakDir, name), code)
})

afterAll(() => {
  if (leakDir) rmSync(leakDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
})

it('has built JavaScript modules to inspect', () => {
  expect(modules.length).toBeGreaterThan(0)
})

it.each(modules.map((file) => [relative(packageDir, file).replaceAll('\\', '/'), file]))('imports %s without browser or global side effects', (_, file) => {
  const { status, output } = importInProbe(file)
  expect(status, output).toBe(0)
})

it.each(Object.keys(leaks))('catches the side effect of %s', (name) => {
  const { status, output } = importInProbe(resolve(leakDir, name))
  expect(status, output).not.toBe(0)
  expect(output).toMatch(/AssertionError/)
})
