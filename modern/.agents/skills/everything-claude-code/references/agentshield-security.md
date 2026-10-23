# AgentShield Security Classification Reference

AgentShield provides automated security inspection to protect repositories from malicious code generation, prompt injections, and operational accidents by AI agents.

## Severity Categories

### 1. Critical (CRITICAL)
- **Hardcoded Secrets**: AWS access keys (`AKIA...`), GitHub personal access tokens (`ghp_...`), private RSA/EC keys (`-----BEGIN ... PRIVATE KEY-----`), JWT tokens, database connection strings with passwords.
- **Remote Execution & Arbitrary Code Ingestion**:
  - `curl ... | bash` or `wget ... | sh`
  - Unsanitized `eval()` or `exec()` on untrusted input
  - Dynamic `Function()` instantiation in JavaScript
- **Destructive File Operations**:
  - `rm -rf /` or wildcard deletion on workspace root without confirmation

### 2. High (HIGH)
- **Command Injection Risks**:
  - `child_process.exec()` or `subprocess.Popen(..., shell=True)` without argument escaping
  - Insecure deserialization (`pickle.loads`, `yaml.load` without `SafeLoader`)
- **Unpinned Dependencies**:
  - Adding unvetted external scripts in HTML (`<script src="http://...">`)
  - Installing untyped packages directly from untrusted URLs

### 3. Medium (MEDIUM)
- **Permissive CORS / Open Redirects**:
  - `Access-Control-Allow-Origin: *` in production routes handling sensitive sessions
- **Information Leaks**:
  - Printing full stack traces to end users in API response payloads
  - Verbose debug logging containing personal user data (PII)

## Continuous Auditing
Run AgentShield on staged or modified files before merging:
```bash
python .agents/skills/everything-claude-code/scripts/agentshield.py --path .
```
