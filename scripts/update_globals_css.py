css_content = """@tailwind base;
@tailwind components;
@tailwind utilities;

/* ---------------------------------------------------- */
/* SCRUMROOM EXECUTIVE DESIGN SYSTEM TOKENS            */
/* ---------------------------------------------------- */
:root {
  --workspace-canvas: #f8faf9;
  --workspace-surface: #ffffff;
  --workspace-ink: #18221e;
  --workspace-muted: #56635d;
  --workspace-line: #e2e7e2;
  --workspace-accent: #0f766e;
  --workspace-accent-hover: #115e59;
  --workspace-accent-light: #f0fdfa;
  --workspace-rail: #261929;
  --workspace-rail-active: #3b2840;
  --workspace-radius: 8px;
  --workspace-card-shadow: 0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03);
  --workspace-hover-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);

  --background: 0 0% 100%;
  --foreground: 210 12% 14%;
  --card: 0 0% 100%;
  --card-foreground: 210 12% 14%;
  --border: 210 10% 88%;
  --input: 210 10% 88%;
  --primary: 173 80% 26%;
  --primary-foreground: 0 0% 100%;
  --radius: 0.5rem;
}

body {
  margin: 0;
  background: var(--workspace-canvas);
  color: var(--workspace-ink);
  font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button, input, textarea, select {
  font-family: inherit;
  font-size: inherit;
}

button {
  cursor: pointer;
  transition: all 120ms cubic-bezier(0.16, 1, 0.3, 1);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

:focus-visible {
  outline: 2px solid var(--workspace-accent);
  outline-offset: 2px;
}

code, kbd, pre, .font-mono {
  font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* ---------------------------------------------------- */
/* WORKSPACE MAIN LAYOUT & SHELL                        */
/* ---------------------------------------------------- */
.scrum-workspace {
  height: 100dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--workspace-canvas);
  color: var(--workspace-ink);
}

.workspace-topbar {
  height: 44px;
  flex-shrink: 0;
  background: #231626;
  color: #f3eff4;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 20px;
  border-bottom: 1px solid #45314a;
  z-index: 10;
}

.workspace-wordmark {
  width: 176px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.brand-symbol {
  font-size: 24px;
  color: #5eead4;
  line-height: 1;
}

.topbar-context {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #dfd4e2;
}

.topbar-telemetry-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  color: #d8b4fe;
}

.topbar-demo-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background: #0f766e;
  border: 1px solid #2dd4bf;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}

.topbar-demo-badge a {
  color: #ccfbf1;
  text-decoration: underline;
  margin-left: 4px;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2dd4bf;
  box-shadow: 0 0 8px #2dd4bf;
  display: inline-block;
  animation: pulseGlow 2s infinite ease-in-out;
}

@keyframes pulseGlow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.account-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  font-size: 13px;
}

.account-menu > span {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #e9d5ff;
}

.account-menu button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.account-menu button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.workspace-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ---------------------------------------------------- */
/* SIDEBAR NAVIGATION                                   */
/* ---------------------------------------------------- */
.workspace-sidebar {
  flex: 0 0 210px;
  width: 210px;
  overflow-y: auto;
  padding: 16px 10px 14px;
  color: #ded5e1;
  background: var(--workspace-rail);
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.workspace-name {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 14px;
}

.workspace-tile {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  background: linear-gradient(135deg, #6d28d9, #4f46e5);
  color: white;
  border-radius: 8px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.workspace-name strong {
  font-size: 15px;
  color: #ffffff;
  display: block;
}

.workspace-name div > span {
  font-size: 12px;
  color: #c4b5fd;
}

.sidebar-label {
  padding: 0 10px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #a78bfa;
  margin-bottom: 6px;
}

.sidebar-link {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 38px;
  padding: 8px 12px;
  border-radius: 6px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  margin: 2px 0;
  color: #e2d9e6;
  background: transparent;
  border: 0;
}

.sidebar-link:hover {
  background: var(--workspace-rail-active);
  color: #ffffff;
}

.sidebar-link.is-active {
  background: #ccfbf1;
  color: #0f766e;
  font-weight: 600;
}

.sidebar-link.is-active svg {
  color: #0f766e;
}

.nav-count {
  margin-left: auto;
  font-size: 12px;
  font-family: 'Geist Mono', monospace;
  padding: 2px 6px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.2);
  color: #ded5e1;
}

.sidebar-link.is-active .nav-count {
  background: #0f766e;
  color: #ffffff;
}

.sidebar-team-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
}

.sidebar-team-label button {
  padding: 4px;
  color: #c4b5fd;
  background: transparent;
  border: 0;
  border-radius: 4px;
}

.sidebar-team-label button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.sidebar-people button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  min-height: 34px;
  padding: 6px 10px;
  font-size: 13px;
  border-radius: 6px;
  color: #e2d9e6;
  background: transparent;
  border: 0;
}

.sidebar-people button:hover {
  background: var(--workspace-rail-active);
}

.person-mini, .bot-mini {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  color: white;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
}

.bot-mini {
  background: #0d9488;
  color: #ffffff;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a78bfa;
  font-size: 12px;
  margin-top: auto;
  padding: 16px 8px 0;
}

.local-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
}

/* ---------------------------------------------------- */
/* WORKSPACE CONTENT PANE                               */
/* ---------------------------------------------------- */
.workspace-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--workspace-canvas);
}

.channel-header {
  height: 62px;
  flex-shrink: 0;
  background: #ffffff;
  border-bottom: 1px solid var(--workspace-line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  gap: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.channel-header h1 {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--workspace-ink);
}

.channel-header h1 svg {
  color: #64748b;
}

.channel-header p {
  font-size: 13px;
  color: var(--workspace-muted);
  margin: 2px 0 0;
}

.header-members {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  flex-shrink: 0;
}

.channel-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.conversation {
  padding: 20px 24px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.channel-intro {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--workspace-line);
}

.channel-intro h2 {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 6px;
  color: var(--workspace-ink);
}

.channel-intro p {
  color: var(--workspace-muted);
  font-size: 14px;
  margin: 0;
}

/* ---------------------------------------------------- */
/* STARTER CHIPS STRIP                                  */
/* ---------------------------------------------------- */
.starter-chips-container {
  margin: 16px 0 20px;
  background: #ffffff;
  border: 1px solid var(--workspace-line);
  border-radius: var(--workspace-radius);
  padding: 16px;
  box-shadow: var(--workspace-card-shadow);
}

.starter-chips-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #0f766e;
  margin-bottom: 10px;
}

.starter-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.starter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  color: #0f766e;
  transition: all 120ms ease;
}

.starter-chip:hover {
  background: #0f766e;
  border-color: #0f766e;
  color: #ffffff;
  transform: translateY(-1px);
}

/* ---------------------------------------------------- */
/* MESSAGES & SPRINT PLAN CARDS                         */
/* ---------------------------------------------------- */
.message {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid var(--workspace-line);
  border-radius: var(--workspace-radius);
  margin-bottom: 14px;
  box-shadow: var(--workspace-card-shadow);
}

.message-avatar {
  height: 34px;
  width: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
}

.scrum-avatar {
  color: #ffffff;
  background: #0f766e;
  box-shadow: 0 2px 6px rgba(15, 118, 110, 0.25);
}

.user-avatar {
  color: #ffffff;
  background: #7c3aed;
}

.message-body {
  min-width: 0;
  flex: 1;
}

.message-author {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.message-author strong {
  font-weight: 700;
  font-size: 14px;
  color: var(--workspace-ink);
}

.message-author > span {
  font-size: 12px;
  color: var(--workspace-muted);
}

.message-author .app-label {
  color: #0f766e;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
}

.plan-preview {
  max-width: none;
  border: 1px solid #ccfbf1;
  border-left: 4px solid #0f766e;
  border-radius: var(--workspace-radius);
  margin: 16px 0;
  background: #ffffff;
  box-shadow: var(--workspace-card-shadow);
  overflow: hidden;
}

.plan-preview-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px 12px;
  background: #f0fdfa;
  border-bottom: 1px solid #ccfbf1;
}

.plan-preview-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f766e;
}

.plan-stats {
  display: flex;
  gap: 24px;
  padding: 14px 20px;
  font-size: 13px;
  color: var(--workspace-muted);
  border-bottom: 1px solid #eef2ef;
}

.plan-stats strong {
  color: var(--workspace-ink);
  font-size: 14px;
}

.epic-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 10px;
  padding: 16px 20px;
  background: #fafbf9;
}

.epic-preview > div {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid var(--workspace-line);
  border-radius: 6px;
  font-size: 13px;
}

.epic-preview > div > span:first-child {
  font-family: 'Geist Mono', monospace;
  color: #0f766e;
  font-weight: 700;
  font-size: 12px;
}

.epic-preview > div strong {
  font-weight: 600;
  flex: 1;
}

.plan-preview-footer {
  display: flex;
  gap: 12px;
  padding: 14px 20px;
  background: #ffffff;
  border-top: 1px solid var(--workspace-line);
}

.primary-button, .secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 16px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  min-height: 38px;
}

.primary-button {
  background: var(--workspace-accent);
  color: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 118, 110, 0.2);
}

.primary-button:hover:not(:disabled) {
  background: var(--workspace-accent-hover);
  transform: translateY(-1px);
}

.secondary-button {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #334155;
}

.secondary-button:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

/* ---------------------------------------------------- */
/* BRIEF COMPOSER                                       */
/* ---------------------------------------------------- */
.composer-area {
  padding: 12px 24px 16px;
  background: #ffffff;
  border-top: 1px solid var(--workspace-line);
  flex-shrink: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.02);
}

.brief-composer {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
  box-shadow: var(--workspace-card-shadow);
  transition: all 120ms ease;
}

.brief-composer:focus-within {
  border-color: #0f766e;
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.15);
}

.composer-project {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 13px;
}

.composer-project label {
  color: #64748b;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.composer-project input {
  width: 100%;
  background: transparent;
  color: var(--workspace-ink);
  border: 0;
  font-weight: 600;
  outline: none;
}

.brief-composer textarea {
  width: 100%;
  resize: vertical;
  min-height: 64px;
  max-height: 140px;
  padding: 12px 16px;
  font-size: 14px;
  border: 0;
  background: #ffffff;
  outline: none;
  line-height: 1.6;
}

.composer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px 12px;
  background: #ffffff;
}

.attach-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.attach-button:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.analysis-option {
  font-size: 12px;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.composer-footnote {
  font-size: 12px;
  color: var(--workspace-muted);
  text-align: right;
  margin-top: 6px;
}

/* ---------------------------------------------------- */
/* KANBAN TASK BOARD ENHANCEMENTS                      */
/* ---------------------------------------------------- */
.task-board-view {
  min-width: 0;
}

.board-view-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--workspace-line);
}

.board-view-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.board-view-title-group h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.board-title-icon {
  color: #0f766e;
}

.board-stats-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 9999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}

.board-instruction {
  font-size: 13px;
  color: var(--workspace-muted);
  margin: 0;
}

.task-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(280px, 1fr));
  gap: 16px;
  align-items: start;
  padding-bottom: 20px;
}

.task-column {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 12px;
  border-radius: var(--workspace-radius);
  min-width: 0;
}

.task-column-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 12px;
}

.column-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-header-left h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.column-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.column-count-badge {
  font-size: 12px;
  font-weight: 700;
  font-family: 'Geist Mono', monospace;
  padding: 2px 7px;
  border-radius: 9999px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.task-column-cards {
  display: grid;
  gap: 10px;
}

.task-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 14px;
  min-width: 0;
  box-shadow: var(--workspace-card-shadow);
  transition: all 120ms ease;
}

.task-card:hover {
  box-shadow: var(--workspace-hover-shadow);
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.task-card-top-tags {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.domain-micro-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid transparent;
  text-transform: capitalize;
}

.story-points-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  font-family: 'Geist Mono', monospace;
  padding: 2px 7px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #334155;
}

.task-card-title {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
  margin: 0 0 10px;
  color: #0f172a;
}

.task-card-title svg {
  color: #94a3b8;
  flex-shrink: 0;
  margin-top: 2px;
}

.status-completed .task-card-title svg {
  color: #16a34a;
}

.task-card-owner-line {
  margin-bottom: 12px;
}

.owner-avatar-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #475569;
  background: #f8fafc;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid #f1f5f9;
}

.task-status-row {
  margin-bottom: 8px;
}

.task-status-label select {
  width: 100%;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  border-radius: 4px;
  padding: 6px 10px;
  color: #334155;
  font-size: 12px;
  font-weight: 500;
  min-height: 32px;
  outline: none;
}

.task-status-label select:focus {
  border-color: #0f766e;
  background: #ffffff;
}

.task-card-details {
  font-size: 13px;
  color: #475569;
  margin-top: 8px;
  border-top: 1px dashed #e2e8f0;
  padding-top: 8px;
}

.task-card-details summary {
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #0f766e;
}

.details-expanded-body {
  margin-top: 8px;
}

.task-epic-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 6px;
}

.story-narrative-text {
  font-size: 12px;
  line-height: 1.5;
  color: #334155;
  margin: 6px 0;
  background: #f8fafc;
  padding: 6px 8px;
  border-radius: 4px;
}

.story-dependencies-box {
  font-size: 11px;
  color: #92400e;
  background: #fef3c7;
  padding: 4px 8px;
  border-radius: 4px;
  margin: 6px 0;
}

.criteria-list-wrapper {
  margin-top: 8px;
}

.criteria-list-title {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 4px;
}

.criteria-list-wrapper ul {
  padding-left: 14px;
  margin: 0;
}

.criteria-list-wrapper li {
  font-size: 12px;
  line-height: 1.45;
  margin-bottom: 4px;
  color: #1e293b;
}

.gherkin-keyword {
  color: #0f766e;
  font-weight: 700;
}

.task-column-empty-state {
  padding: 24px 12px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.5);
}

/* ---------------------------------------------------- */
/* MODERN LOGIN PAGE & HERO STYLING                    */
/* ---------------------------------------------------- */
.login-page-modern {
  min-height: 100dvh;
  background: #0f0a12;
  color: #f8fafc;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.login-mesh-bg {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(at 15% 15%, rgba(15, 118, 110, 0.25) 0px, transparent 50%),
    radial-gradient(at 85% 10%, rgba(124, 58, 237, 0.22) 0px, transparent 50%),
    radial-gradient(at 50% 85%, rgba(15, 118, 110, 0.15) 0px, transparent 50%);
  filter: blur(60px);
  z-index: 1;
}

.login-header-bar {
  position: relative;
  z-index: 2;
  height: 68px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.login-brand-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-logo-mark {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #0d9488, #6366f1);
  color: #ffffff;
  display: grid;
  place-items: center;
  border-radius: 10px;
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 0 16px rgba(45, 212, 191, 0.35);
}

.login-wordmark strong {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.login-version-tag {
  margin-left: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #2dd4bf;
  background: rgba(45, 212, 191, 0.12);
  border: 1px solid rgba(45, 212, 191, 0.25);
  padding: 2px 7px;
  border-radius: 9999px;
}

.login-header-pills {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-telemetry-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 9999px;
}

.header-demo-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  background: #0f766e;
  border: 1px solid #2dd4bf;
  padding: 6px 14px;
  border-radius: 9999px;
  text-decoration: none;
  transition: all 120ms ease;
}

.header-demo-button:hover {
  background: #115e59;
  transform: translateY(-1px);
}

.login-container {
  position: relative;
  z-index: 2;
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 32px;
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 48px;
  align-items: center;
}

.login-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  background: rgba(45, 212, 191, 0.1);
  border: 1px solid rgba(45, 212, 191, 0.3);
  color: #2dd4bf;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
}

.badge-icon {
  color: #2dd4bf;
}

.login-headline {
  font-size: clamp(34px, 4.2vw, 48px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: #ffffff;
  margin: 0 0 18px;
}

.gradient-text {
  background: linear-gradient(135deg, #2dd4bf 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-subcopy {
  font-size: 16px;
  line-height: 1.65;
  color: #94a3b8;
  max-width: 540px;
  margin-bottom: 32px;
}

.login-feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.feature-pill-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  backdrop-filter: blur(12px);
}

.feature-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(45, 212, 191, 0.12);
  color: #2dd4bf;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.feature-pill-card strong {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 3px;
}

.feature-pill-card p {
  font-size: 11px;
  line-height: 1.45;
  color: #94a3b8;
  margin: 0;
}

/* Modern Card Panel */
.login-card-panel {
  background: rgba(24, 18, 29, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(20px);
}

.panel-glass-header {
  margin-bottom: 24px;
}

.panel-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #2dd4bf;
  display: block;
  margin-bottom: 6px;
}

.panel-glass-header h2 {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin: 0 0 6px;
}

.panel-glass-header p {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.login-actions-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.google-signin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  min-height: 48px;
  padding: 12px 18px;
  background: #ffffff;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.google-signin-btn:hover:not(:disabled) {
  background: #f8fafc;
  transform: translateY(-1px);
}

.login-or-divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  margin: 6px 0;
}

.login-or-divider::before, .login-or-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.login-or-divider span {
  padding: 0 12px;
}

.demo-enter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 48px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #ffffff;
  border: 1px solid #2dd4bf;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.35);
  transition: all 120ms ease;
}

.demo-enter-btn:hover {
  background: linear-gradient(135deg, #115e59, #0d9488);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(13, 148, 136, 0.45);
}

.demo-enter-btn .arrow-icon {
  transition: transform 120ms ease;
}

.demo-enter-btn:hover .arrow-icon {
  transform: translateX(3px);
}

.oauth-setup-notice {
  margin-top: 20px;
  padding: 14px 16px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: #fde68a;
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #fbbf24;
}

.oauth-setup-notice code {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  color: #ffffff;
}

.setup-tip {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(245, 158, 11, 0.2);
  color: #fef3c7;
}

.panel-footer-guarantee {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 20px;
  justify-content: center;
}

.login-page-footer {
  position: relative;
  z-index: 2;
  padding: 20px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 12px;
  color: #64748b;
}

@media (max-width: 900px) {
  .login-container {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 32px 20px;
  }
  .login-headline {
    font-size: 32px;
  }
}

@media (max-width: 640px) {
  .login-header-bar {
    padding: 0 16px;
  }
  .header-telemetry-pill {
    display: none;
  }
  .login-feature-grid {
    grid-template-columns: 1fr;
  }
  .login-page-footer {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}
"""

with open(r"c:\Users\PLP\Music\Scrum stuff mine\app\globals.css", "w", encoding="utf-8") as f:
    f.write(css_content)
print("Updated app/globals.css with executive design tokens and modern styles")
