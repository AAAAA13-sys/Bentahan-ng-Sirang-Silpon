# The Four Karpathy Tenets: Detailed Guide & Anti-Patterns

## Tenet 1: Think Before Coding
### What It Means
LLMs frequently hallucinate intent by leaping directly to code generation. "Think Before Coding" requires the model to pause, analyze the problem state, trace dependencies, and form an explicit hypothesis.

### Anti-Patterns
- **The Speed Trap**: Emitting 300 lines of code in response to a 1-sentence prompt without examining existing codebase patterns.
- **Silent Assumptions**: Guessing parameter names, database schemas, or API endpoints without verifying in the active code.

---

## Tenet 2: Simplicity First
### What It Means
The most reliable code is the code that is never written. Always prefer direct, transparent, idiomatic implementations over deep inheritance trees or multi-layered abstractions.

### Anti-Patterns
- **Future-Proofing Syndrome**: Writing generic plugin systems for an app that only needs a single feature.
- **Dependency Addiction**: Pulling in a 20MB npm package to do string manipulation or date formatting that takes 3 lines of native JavaScript.

---

## Tenet 3: Surgical Changes
### What It Means
Every modified line of code carries regression risk. A pull request or change should be minimal, tightly scoped, and isolated.

### Anti-Patterns
- **The Format Avalanche**: Running an auto-formatter over an entire 2,000-line file when you only needed to modify 2 lines, polluting git blame history.
- **Scope Creep Cleanup**: Refactoring unrelated legacy functions while fixing a localized bug.

---

## Tenet 4: Goal-Driven Execution & Verification
### What It Means
Development without verification is guessing. Every coding action must be paired with an empirical verification loop.

### Checklist Before Task Completion
1. Did you run the unit / integration test suite?
2. Did you check compiler / linter warnings?
3. Did you review `git diff` for unintended changes?
4. Did you run the application or command and verify the actual output?
