google_login_code = """\"use client\";

import { useEffect, useState } from \"react\";
import { authClient } from \"@/lib/auth-client\";
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Users, ListTodo, AlertCircle, Lock } from \"lucide-react\";

export default function GoogleLogin({ configured }: { configured: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(\"\");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has(\"error\")) {
      setError(\"Google sign-in did not complete. Please try again and choose your authorized Google account.\");
    }
  }, []);

  async function signIn() {
    setBusy(true);
    setError(\"\");
    try {
      const result = await authClient.signIn.social({
        provider: \"google\",
        callbackURL: \"/\",
        errorCallbackURL: \"/?error=google\",
      });
      if (result.error) {
        setError(\"Google sign-in could not start. Check your client credentials and redirect URI in .env.local.\");
        setBusy(false);
      }
    } catch {
      setError(\"Could not connect to authentication handler. Ensure your Next.js local server is running.\");
      setBusy(false);
    }
  }

  return (
    <main className=\"login-page-modern\">
      {/* Background ambient mesh */}
      <div className=\"login-mesh-bg\" aria-hidden=\"true\" />

      <header className=\"login-header-bar\">
        <div className=\"login-brand-group\">
          <div className=\"login-logo-mark\">
            <span>s.</span>
          </div>
          <div className=\"login-wordmark\">
            <strong>scrumroom</strong>
            <span className=\"login-version-tag\">AI v2.0</span>
          </div>
        </div>

        <div className=\"login-header-pills\">
          <span className=\"header-telemetry-pill\">
            <span className=\"pulse-dot\" />
            GLM-5.3-Flash Runtime Ready
          </span>
          <a href=\"/?demo=true\" className=\"header-demo-button\">
            Live Demo ↗
          </a>
        </div>
      </header>

      <div className=\"login-container\">
        <div className=\"login-hero-section\">
          <div className=\"login-hero-badge\">
            <Sparkles size={14} className=\"badge-icon\" />
            <span>Autonomous Agile / Scrum Operations Engine</span>
          </div>

          <h1 className=\"login-headline\">
            Where Engineering Teams <br />
            <span className=\"gradient-text\">Ship Sprints Faster.</span>
          </h1>

          <p className=\"login-subcopy\">
            Turn messy assignment briefs into atomic epics, balanced point capacities, 
            and Gherkin acceptance criteria in seconds. Built specifically for student and collegiate teams.
          </p>

          <div className=\"login-feature-grid\">
            <div className=\"feature-pill-card\">
              <div className=\"feature-icon-box\"><Cpu size={16} /></div>
              <div>
                <strong>Autonomous Breakdown</strong>
                <p>Prompt-to-backlog decomposition with dependency graph verification</p>
              </div>
            </div>

            <div className=\"feature-pill-card\">
              <div className=\"feature-icon-box\"><Users size={16} /></div>
              <div>
                <strong>Capacity Balancer</strong>
                <p>Deterministic workload allocation honoring skill tags & point limits</p>
              </div>
            </div>

            <div className=\"feature-pill-card\">
              <div className=\"feature-icon-box\"><ListTodo size={16} /></div>
              <div>
                <strong>Gherkin Scenarios</strong>
                <p>Given-When-Then criteria ready for tests and PR reviews</p>
              </div>
            </div>

            <div className=\"feature-pill-card\">
              <div className=\"feature-icon-box\"><Lock size={16} /></div>
              <div>
                <strong>Scoped Local Privacy</strong>
                <p>Zero cross-account leaking; localStorage isolated per Google identity</p>
              </div>
            </div>
          </div>
        </div>

        <section className=\"login-card-panel\" aria-labelledby=\"login-panel-title\">
          <div className=\"panel-glass-header\">
            <span className=\"panel-eyebrow\">YOUR WORKSPACE GATEWAY</span>
            <h2 id=\"login-panel-title\">Sign In to Scrumroom</h2>
            <p>Access your private sprint board, story allocations, and team directory.</p>
          </div>

          {error && (
            <div className=\"login-error-alert\" role=\"alert\">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className=\"login-actions-stack\">
            <button
              type=\"button\"
              className=\"google-signin-btn\"
              disabled={!configured || busy}
              onClick={() => void signIn()}
              aria-label=\"Continue with Google Account\"
            >
              <svg className=\"google-svg-icon\" viewBox=\"0 0 24 24\" width=\"18\" height=\"18\">
                <path fill=\"#4285F4\" d=\"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z\"/>
                <path fill=\"#34A853\" d=\"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z\"/>
                <path fill=\"#FBBC05\" d=\"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z\"/>
                <path fill=\"#EA4335\" d=\"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z\"/>
              </svg>
              <span>{busy ? \"Connecting to Google...\" : \"Continue with Google\"}</span>
            </button>

            <div className=\"login-or-divider\">
              <span>OR EXPLORE INSTANTLY</span>
            </div>

            <a href=\"/?demo=true\" className=\"demo-enter-btn\">
              <Sparkles size={16} />
              <span>Launch Live Interactive Demo</span>
              <ArrowRight size={16} className=\"arrow-icon\" />
            </a>
          </div>

          {!configured && (
            <div className=\"oauth-setup-notice\" role=\"status\">
              <div className=\"notice-header\">
                <AlertCircle size={15} />
                <strong>Google OAuth Setup Notice</strong>
              </div>
              <p>
                To enable Google sign-in for your team, provide <code>BETTER_AUTH_SECRET</code> and Google OAuth keys in <code>.env.local</code>.
              </p>
              <div className=\"setup-tip\">
                <span>Tip: Click <strong>Launch Live Interactive Demo</strong> above to test full backlog generation, Kanban movement, and team allocations right now without Google credentials!</span>
              </div>
            </div>
          )}

          <div className=\"panel-footer-guarantee\">
            <ShieldCheck size={14} />
            <span>Encrypted local session · Scoped per account · Strict privacy</span>
          </div>
        </section>
      </div>

      <footer className=\"login-page-footer\">
        <span>© 2026 Scrumroom. Autonomous Agile Engine for Student Teams.</span>
        <span>Built with Next.js 15, Better Auth & GLM Free</span>
      </footer>
    </main>
  );
}
"""

with open(r"c:\Users\PLP\Music\Scrum stuff mine\components\GoogleLogin.tsx", "w", encoding="utf-8") as f:
    f.write(google_login_code)
print("Updated components/GoogleLogin.tsx")
