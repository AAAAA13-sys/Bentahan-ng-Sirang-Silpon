# The Ladder of Laziness & Dependency Replacement Matrix

## The 7-Step Evaluation Checklist

Before writing any new code or installing packages, evaluate these 7 steps in order:

1. **YAGNI (You Aren't Gonna Need It)**: Challenge the requirement. Is this speculative or genuinely needed for the immediate goal?
2. **Internal Reuse**: Search the codebase for existing utility functions, hooks, or shared types.
3. **Standard Library**: Does the language include a built-in module for this?
4. **Native Platform APIs**: Does the modern runtime (browser, Node 18+, modern Python) provide a native API?
5. **Existing Dependencies**: If a package is already installed (e.g., `lodash-es`), use it instead of adding another (e.g., `ramda`).
6. **Inlined Simplicity**: Can a 3-line inline function replace a 10KB library?
7. **Minimal Addition**: If a dependency is strictly necessary, choose the smallest, zero-dependency, tree-shakeable alternative.

---

## Dependency Replacement Matrix

| External Dependency | Native / Standard Replacement | Saved Overhead |
|:---|:---|:---|
| `uuid` | `crypto.randomUUID()` | ~12KB |
| `axios` | Native `fetch()` | ~45KB |
| `moment` / `dayjs` | Native `Intl.DateTimeFormat` / `Date` | ~70KB - 300KB |
| `lodash.get` / `lodash.isEqual` | Optional chaining `?.` / shallow equals | ~25KB |
| `chalk` | ANSI escape codes / `util.styleText` | ~30KB |
| `mkdirp` | `fs.mkdirSync(path, { recursive: true })` | ~15KB |
| `rimraf` | `fs.rmSync(path, { recursive: true, force: true })`| ~20KB |
| `is-odd` / `is-even` | Inline `n % 2 !== 0` | 100% |
| `requests` (Python) | `urllib.request` (for basic HTTP) | External dependency |
