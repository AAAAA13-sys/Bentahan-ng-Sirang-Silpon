"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Bot,
  Check,
  ChevronRight,
  Copy,
  FileText,
  Hash,
  ListTodo,
  Loader2,
  Pencil,
  Plus,
  Upload,
  Users,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";
import type {
  BacklogDecompositionResponse,
  DomainTag,
  StoryExtractionDTO,
  TeamMember,
} from "@/types/scrum";
import { allocateWorkload } from "@/lib/allocator";
import {
  decompositionSchema,
  readDecompositionResponse,
} from "@/lib/decomposition-response";
import TaskBoard from "@/components/TaskBoard";
import TeamDirectory from "@/components/TeamDirectory";
import { authClient } from "@/lib/auth-client";
import { accountStorageKey, savedTeamSchema } from "@/lib/account-storage";
import TeamMemberModal from "@/components/TeamMemberModal";

const DOMAINS: Record<DomainTag, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  devops: "DevOps",
  docs: "Documentation",
  qa: "QA & testing",
};

const SAMPLE_TEAM: TeamMember[] = [
  {
    userId: "mem-01",
    name: "Alex Reyes",
    handle: "alex.lead",
    role: "Lead Frontend Dev",
    skills: ["frontend"],
    weeklyCapacityPoints: 15,
    avatarColor: "#0284c7",
  },
  {
    userId: "mem-02",
    name: "Bea Santos",
    handle: "bea.dev",
    role: "Junior Frontend Dev",
    skills: ["frontend", "docs"],
    weeklyCapacityPoints: 10,
    avatarColor: "#7c3aed",
  },
  {
    userId: "mem-03",
    name: "Charlie Cruz",
    handle: "charlie.qa",
    role: "QA / Test Engineer",
    skills: ["qa"],
    weeklyCapacityPoints: 12,
    avatarColor: "#d97706",
  },
  {
    userId: "mem-04",
    name: "Dana Diaz",
    handle: "dana.ux",
    role: "UX/UI Designer",
    skills: ["frontend", "docs"],
    weeklyCapacityPoints: 8,
    avatarColor: "#059669",
  },
];

const SAMPLE_CALCULATOR_BACKLOG: BacklogDecompositionResponse = {
  projectName: "Web Calculator MVP",
  summary:
    "Functional, accessible, and responsive Web Calculator MVP built with standard arithmetic, keyboard support, and unit tests.",
  epics: [
    {
      epicTitle: "UI Layout & Styling",
      description: "CSS Grid layout, responsive button press animations, and accessible display.",
      stories: [
        {
          id: "STORY-01",
          title: "Keypad & Display Layout",
          narrative:
            "As a user, I want a clear 0-9 numeric keypad, operator grid, and result screen so that I can input numbers comfortably.",
          acceptanceCriteria: [
            "Given a screen size >= 320px When rendered Then display screen and 0-9 keypad are visible",
            "Given operator keys When pressed Then visual button depress animation triggers",
          ],
          storyPoints: 5,
          domainTag: "frontend",
          dependencies: [],
        },
        {
          id: "STORY-02",
          title: "Theme Support & Contrast",
          narrative:
            "As a user, I want high-contrast button styling and dark/light support so that the calculator is readable in all lighting.",
          acceptanceCriteria: [
            "Given daylight or low-light When viewing Then text-to-surface contrast meets WCAG AA (>= 4.5:1)",
            "Given system dark mode When enabled Then theme shifts seamlessly without flash",
          ],
          storyPoints: 3,
          domainTag: "frontend",
          dependencies: ["STORY-01"],
        },
      ],
    },
    {
      epicTitle: "Core Calculation Logic",
      description:
        "State engine handling operator precedence, floating-point precision, and edge-case validation.",
      stories: [
        {
          id: "STORY-03",
          title: "Basic & Chained Arithmetic",
          narrative:
            "As a student, I want addition, subtraction, multiplication, and division chained accurately so that I can compute formulas.",
          acceptanceCriteria: [
            "Given input '12 + 34 =' When calculated Then display outputs '46'",
            "Given sequential chained operations '2 + 3 * 4 =' When evaluated Then strict precedence returns '14'",
          ],
          storyPoints: 8,
          domainTag: "backend",
          dependencies: ["STORY-01"],
        },
        {
          id: "STORY-04",
          title: "Floating-Point & Decimal Precision",
          narrative:
            "As a student, I want floating point arithmetic without IEEE 754 precision artifacts so that 0.1 + 0.2 equals 0.3.",
          acceptanceCriteria: [
            "Given decimal input '0.1 + 0.2 =' When calculated Then result displays exactly '0.3'",
            "Given multiple decimal clicks When entered Then only one decimal point is accepted per operand",
          ],
          storyPoints: 5,
          domainTag: "backend",
          dependencies: ["STORY-03"],
        },
        {
          id: "STORY-05",
          title: "Division by Zero & Overflow Guard",
          narrative:
            "As a user, I want clear error feedback on divide by zero and numeric overflow so that the app never crashes.",
          acceptanceCriteria: [
            "Given division by zero '42 / 0 =' When submitted Then display gracefully shows 'Cannot divide by zero'",
            "Given numeric overflow exceeding 16 digits When computed Then scientific notation or 'Overflow' is rendered",
          ],
          storyPoints: 3,
          domainTag: "backend",
          dependencies: ["STORY-03"],
        },
      ],
    },
    {
      epicTitle: "Accessibility & Quality Assurance",
      description:
        "Keyboard navigation, screen-reader ARIA live regions, and edge-case unit test coverage.",
      stories: [
        {
          id: "STORY-06",
          title: "Physical Keyboard Input Listeners",
          narrative:
            "As a power user, I want physical keyboard bindings (0-9, +, -, *, /, Enter, Backspace, Escape) so that I can calculate without clicking.",
          acceptanceCriteria: [
            "Given physical keyboard input '7' When pressed Then '7' appears on screen and 7 button flashes active",
            "Given Escape key When pressed Then clear action resets calculator state",
          ],
          storyPoints: 5,
          domainTag: "frontend",
          dependencies: ["STORY-01", "STORY-03"],
        },
        {
          id: "STORY-07",
          title: "Screen Reader & ARIA Live Regions",
          narrative:
            "As an accessible user, I want screen reader announcements on calculation results so that I can hear answers in real time.",
          acceptanceCriteria: [
            "Given calculation result When produced Then aria-live assertive region announces result text",
            "Given all buttons When focused Then aria-label describes exact function (e.g. 'Clear all values')",
          ],
          storyPoints: 3,
          domainTag: "docs",
          dependencies: ["STORY-06"],
        },
        {
          id: "STORY-08",
          title: "Calculation Engine Unit Test Suite",
          narrative:
            "As an engineer, I want automated unit tests for math operations so that regressions are blocked in CI.",
          acceptanceCriteria: [
            "Given unit test suite When executed Then 100% of arithmetic edge cases and zero division tests pass",
            "Given precision test When run Then float rounding satisfies IEEE 754 precision boundaries",
          ],
          storyPoints: 5,
          domainTag: "qa",
          dependencies: ["STORY-04", "STORY-05"],
        },
      ],
    },
  ],
  totalStories: 8,
  totalEstimatedPoints: 34,
  criticalPathNotice:
    "Critical Path: Keypad Layout (STORY-01) -> Core Arithmetic (STORY-03) -> Decimal Precision (STORY-04) -> QA Engine Tests (STORY-08).",
};

type View = "channel" | "backlog" | "team" | "criteria";

export default function ScrumWorkspace({
  account,
  isGuest = false,
}: {
  account: { name: string; email: string };
  isGuest?: boolean;
}) {
  const teamKey = accountStorageKey(account.email, "team");
  const backlogKey = accountStorageKey(account.email, "backlog");
  const [canImport, setCanImport] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [view, setView] = useState<View>("channel");
  const [projectName, setProjectName] = useState("");
  const [brief, setBrief] = useState("");
  const [submittedBrief, setSubmittedBrief] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decomposition, setDecomposition] = useState<BacklogDecompositionResponse | null>(null);
  const [modelUsed, setModelUsed] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [domain, setDomain] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      setCanImport(
        !localStorage.getItem(teamKey) &&
          !localStorage.getItem(backlogKey) &&
          Boolean(
            localStorage.getItem("scrumai_team_members") ||
              localStorage.getItem("scrumai_saved_backlog")
          )
      );

      const savedMembers = localStorage.getItem(teamKey);
      if (savedMembers) {
        setMembers(savedTeamSchema.parse(JSON.parse(savedMembers)));
      } else if (isGuest) {
        // Automatically provide sample team in demo mode if empty
        setMembers(SAMPLE_TEAM);
      }

      const savedBacklog = localStorage.getItem(backlogKey);
      if (savedBacklog) {
        const saved = decompositionSchema.parse(JSON.parse(savedBacklog));
        setDecomposition(saved);
        setProjectName(saved.projectName);
      } else if (isGuest) {
        // Automatically provide calculator demo backlog in demo mode
        setDecomposition(SAMPLE_CALCULATOR_BACKLOG);
        setProjectName(SAMPLE_CALCULATOR_BACKLOG.projectName);
        setModelUsed("glm-5.3-flash-free");
      }
    } catch {
      setError("Saved workspace data could not be loaded. You can still submit a new brief.");
    }
  }, [teamKey, backlogKey, isGuest]);

  const stories = useMemo(
    () => decomposition?.epics.flatMap((epic) => epic.stories) ?? [],
    [decomposition]
  );
  const allocation = useMemo(
    () => (decomposition ? allocateWorkload(stories, members) : null),
    [decomposition, stories, members]
  );
  const totalPoints = stories.reduce((sum, story) => sum + story.storyPoints, 0);
  const capacity = members.reduce((sum, member) => sum + member.weeklyCapacityPoints, 0);

  function saveMembers(updated: TeamMember[]) {
    setMembers(updated);
    try {
      localStorage.setItem(teamKey, JSON.stringify(updated));
    } catch {
      setError("Your team changes are available for this session, but could not be saved on this device.");
    }
  }

  async function signOut() {
    setSigningOut(true);
    setError(null);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign-out failed. Please try again.");
      window.location.assign("/");
    } catch {
      setError("Could not sign out. Please try again.");
      setSigningOut(false);
    }
  }

  function loadDemoData() {
    setDecomposition(SAMPLE_CALCULATOR_BACKLOG);
    setProjectName(SAMPLE_CALCULATOR_BACKLOG.projectName);
    setModelUsed("glm-5.3-flash-free");
    setMembers(SAMPLE_TEAM);
    try {
      localStorage.setItem(backlogKey, JSON.stringify(SAMPLE_CALCULATOR_BACKLOG));
      localStorage.setItem(teamKey, JSON.stringify(SAMPLE_TEAM));
    } catch {}
  }

  function resetWorkspace() {
    setDecomposition(null);
    setProjectName("");
    setSubmittedBrief("");
    setBrief("");
    try {
      localStorage.removeItem(backlogKey);
    } catch {}
  }

  async function deconstruct() {
    if (!brief.trim()) return;
    setLoading(true);
    setError(null);
    setSubmittedBrief(brief);
    try {
      const response = await fetch("/api/deconstruct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: projectName || "Sprint Project", text: brief }),
      });
      const result = await readDecompositionResponse(response);
      setDecomposition(result.data);
      setModelUsed(result.modelUsed);
      setProjectName(result.data.projectName);
      try {
        localStorage.setItem(backlogKey, JSON.stringify(result.data));
      } catch {}
      setBrief("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string, id: string) {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="scrum-workspace">
      {/* Top Bar */}
      <header className="workspace-topbar">
        <div className="workspace-wordmark">
          <span className="brand-symbol">s.</span>
          <span>scrumroom</span>
        </div>

        <div className="topbar-context">
          <span className="topbar-telemetry-chip">
            <span className="pulse-dot" />
            GLM Free Active
          </span>
          {isGuest && (
            <span className="topbar-demo-badge">
              Guest Demo Session
              <a href="/">Exit</a>
            </span>
          )}
          {decomposition && (
            <span style={{ fontSize: '13px', color: '#c4b5fd', fontWeight: 500 }}>
              Sprint: <strong>{decomposition.projectName}</strong> ({stories.length} stories · {totalPoints} pts)
            </span>
          )}
        </div>

        <div className="account-menu">
          <span>{account.name}</span>
          <button disabled={signingOut} onClick={signOut}>
            {signingOut ? "Signing out…" : isGuest ? "Sign In" : "Sign out"}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="workspace-layout">
        {/* Navigation Sidebar */}
        <aside className="workspace-sidebar">
          <div className="workspace-name">
            <div className="workspace-tile">S</div>
            <div>
              <strong>{decomposition?.projectName || "Sprint Workspace"}</strong>
              <span>{members.length} members</span>
            </div>
          </div>

          <span className="sidebar-label">Channels</span>
          <button
            className={`sidebar-link ${view === "channel" ? "is-active" : ""}`}
            onClick={() => setView("channel")}
          >
            <Hash size={16} />
            <span>scrum-master</span>
          </button>

          <span className="sidebar-label" style={{ marginTop: '16px' }}>Operations</span>
          <button
            className={`sidebar-link ${view === "backlog" ? "is-active" : ""}`}
            onClick={() => setView("backlog")}
          >
            <ListTodo size={16} />
            <span>Kanban Board</span>
            {stories.length > 0 && <span className="nav-count">{stories.length}</span>}
          </button>

          <button
            className={`sidebar-link ${view === "criteria" ? "is-active" : ""}`}
            onClick={() => setView("criteria")}
          >
            <FileText size={16} />
            <span>Acceptance Criteria</span>
          </button>

          <button
            className={`sidebar-link ${view === "team" ? "is-active" : ""}`}
            onClick={() => setView("team")}
          >
            <Users size={16} />
            <span>Team &amp; Capacity</span>
            <span className="nav-count">{members.length}</span>
          </button>

          <div className="sidebar-team-label">
            <span className="sidebar-label" style={{ padding: 0 }}>Roster</span>
            <button onClick={() => { setEditingMember(null); setModalOpen(true); }} title="Add member">
              <Plus size={14} />
            </button>
          </div>

          <div className="sidebar-people">
            <button onClick={() => setView("channel")}>
              <span className="bot-mini"><Bot size={13} /></span>
              <span>GLM Scrum Master</span>
            </button>
            {members.map((m) => (
              <button key={m.userId} onClick={() => { setEditingMember(m); setModalOpen(true); }}>
                <span className="person-mini" style={{ background: m.avatarColor }}>
                  {m.name.slice(0, 2).toUpperCase()}
                </span>
                <span>{m.name}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-footer">
            <span className="local-dot" />
            <span>Local privacy guaranteed</span>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="workspace-main">
          {view === "channel" ? (
            <div className="channel-view">
              <div className="channel-header">
                <div>
                  <h1>
                    <Hash size={18} />
                    <span>scrum-master</span>
                  </h1>
                  <p>Autonomous AI Scrum Master powered by GLM Free. Propose briefs, balance workloads, generate Gherkin.</p>
                </div>
                <div className="header-members">
                  <Users size={15} />
                  <span>{members.length} members · {capacity} pts capacity</span>
                </div>
              </div>

              <div className="conversation">
                <div className="channel-intro">
                  <h2>Welcome to #scrum-master</h2>
                  <p>
                    Post your project brief or assignment prompt below. Your autonomous Scrum Master will break it down into
                    atomic epics, story points, and acceptance criteria.
                  </p>
                </div>

                {/* Starter Chips Bar */}
                <div className="starter-chips-container">
                  <div className="starter-chips-title">
                    <Sparkles size={14} />
                    <span>Quick Starter Actions &amp; Sample Data</span>
                  </div>
                  <div className="starter-chips-row">
                    <button className="starter-chip" onClick={loadDemoData}>
                      🧮 Load Calculator MVP Backlog (8 stories)
                    </button>
                    <button className="starter-chip" onClick={() => saveMembers(SAMPLE_TEAM)}>
                      👥 Seed 4-Member Engineering Team
                    </button>
                    <button
                      className="starter-chip"
                      onClick={() => {
                        setProjectName("Web Calculator MVP");
                        setBrief(
                          "Build and ship a functional, responsive Web Calculator MVP within a 1-week sprint. Support standard operators (+, -, *, /), keyboard listeners, decimal precision, and unit tests."
                        );
                        composer.current?.focus();
                      }}
                    >
                      📝 Insert Sample Brief into Composer
                    </button>
                    {decomposition && (
                      <button className="starter-chip" onClick={resetWorkspace} style={{ color: '#b91c1c' }}>
                        <RotateCcw size={13} /> Reset Sprint
                      </button>
                    )}
                  </div>
                </div>

                {/* Initial Assistant Message */}
                <article className="message">
                  <div className="message-avatar scrum-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="message-body">
                    <div className="message-author">
                      <strong>GLM Free Scrum Master</strong>
                      <span className="app-label">Autonomous AI</span>
                      <span>Ready</span>
                    </div>
                    <p>
                      Hello! I am your AI Scrum Master. Paste your product brief or user stories in the composer below.
                      I will analyze the scope, compute story points, balance assignments against your team roster, and write Gherkin scenarios.
                    </p>
                  </div>
                </article>

                {/* Submitted Brief Preview */}
                {submittedBrief && (
                  <article className="message">
                    <div className="message-avatar user-avatar">
                      <span>{account.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="message-body">
                      <div className="message-author">
                        <strong>{account.name}</strong>
                        <span>Submitted Brief</span>
                      </div>
                      <details className="submitted-brief">
                        <summary>View submitted project brief ({submittedBrief.length} characters)</summary>
                        <p>{submittedBrief}</p>
                      </details>
                    </div>
                  </article>
                )}

                {/* Active Decomposition Plan Preview Card */}
                {decomposition && (
                  <article className="message">
                    <div className="message-avatar scrum-avatar">
                      <Bot size={20} />
                    </div>
                    <div className="message-body">
                      <div className="message-author">
                        <strong>GLM Free Scrum Master</strong>
                        <span className="app-label">Sprint Plan Generated</span>
                        <span>{modelUsed || "glm-5.3-flash-free"}</span>
                      </div>

                      <div className="plan-preview">
                        <div className="plan-preview-title">
                          <CheckCircle2 size={18} color="#0f766e" />
                          <h3>Sprint Breakdown: {decomposition.projectName}</h3>
                        </div>

                        <div className="plan-stats">
                          <div>
                            <strong>{stories.length}</strong> stories
                          </div>
                          <div>
                            <strong>{totalPoints}</strong> total estimated points
                          </div>
                          <div>
                            <strong>{allocation?.totalAssignedPoints ?? 0}</strong> assigned points
                          </div>
                          <div>
                            <strong>{decomposition.epics.length}</strong> epics
                          </div>
                        </div>

                        <div className="epic-preview">
                          {decomposition.epics.map((epic, idx) => (
                            <div key={idx}>
                              <span>EPIC-{String(idx + 1).padStart(2, "0")}</span>
                              <strong>{epic.epicTitle}</strong>
                              <span>{epic.stories.length} stories</span>
                            </div>
                          ))}
                        </div>

                        <div className="plan-preview-footer">
                          <button className="primary-button" onClick={() => setView("backlog")}>
                            <ListTodo size={15} />
                            <span>Open Sprint Kanban Board ({stories.length} cards) ↗</span>
                          </button>
                          <button className="secondary-button" onClick={() => setView("criteria")}>
                            <FileText size={15} />
                            <span>Review Gherkin Criteria ↗</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )}

                {loading && (
                  <article className="message" role="status">
                    <div className="message-avatar scrum-avatar">
                      <Bot size={20} />
                    </div>
                    <div className="message-body">
                      <div className="message-author">
                        <strong>GLM Free</strong>
                        <span className="app-label">Analyzing</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f766e', marginTop: '6px' }}>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Deconstructing project brief into atomic epics &amp; Given/When/Then scenarios…</span>
                      </div>
                    </div>
                  </article>
                )}
              </div>

              {/* Composer */}
              <div className="composer-area">
                {error && <div className="workspace-error" role="alert">{error}</div>}
                <form
                  className="brief-composer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void deconstruct();
                  }}
                >
                  <div className="composer-project">
                    <label htmlFor="project-name">Project:</label>
                    <input
                      id="project-name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. Web Calculator MVP"
                      maxLength={200}
                      disabled={loading}
                    />
                  </div>
                  <textarea
                    id="project-brief"
                    ref={composer}
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="Paste your project requirements, assignments, or user stories here for GLM Free…"
                    disabled={loading}
                    maxLength={100000}
                    rows={2}
                  />
                  <div className="composer-toolbar">
                    <div>
                      <input
                        ref={fileInput}
                        type="file"
                        accept=".txt,.md,text/plain,text/markdown"
                        className="sr-only"
                        tabIndex={-1}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFileName(file.name);
                            const reader = new FileReader();
                            reader.onload = () => setBrief(String(reader.result || ""));
                            reader.readAsText(file);
                          }
                          e.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        className="attach-button"
                        onClick={() => fileInput.current?.click()}
                        disabled={loading}
                      >
                        <Upload size={14} />
                        <span>{fileName || "Attach .txt / .md brief"}</span>
                      </button>
                      <span className="analysis-option">
                        <Bot size={13} /> GLM-5.3-Flash Active
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="primary-button"
                      disabled={loading || !brief.trim()}
                    >
                      {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowUp size={15} />}
                      <span>{loading ? "Deconstructing…" : "Deconstruct Brief"}</span>
                    </button>
                  </div>
                </form>
                <p className="composer-footnote">GLM Free analyzes the brief. Your team reviews the scope and estimates.</p>
              </div>
            </div>
          ) : (
            <div className="workspace-content">
              {error && <div className="workspace-error" role="alert">{error}</div>}

              {view === "team" ? (
                <TeamDirectory
                  members={members}
                  allocationResult={allocation}
                  onAddMember={() => {
                    setEditingMember(null);
                    setModalOpen(true);
                  }}
                  onEditMember={(m) => {
                    setEditingMember(m);
                    setModalOpen(true);
                  }}
                  onDeleteMember={(id) => saveMembers(members.filter((m) => m.userId !== id))}
                />
              ) : !decomposition ? (
                <div className="empty-view">
                  <FileText size={32} />
                  <h2>{view === "backlog" ? "Your backlog starts with a brief." : "Acceptance criteria will appear here."}</h2>
                  <p>Give GLM Free your project requirements or load the sample calculator backlog to start planning.</p>
                  <button className="primary-button" onClick={loadDemoData}>
                    <Sparkles size={15} />
                    <span>Load Calculator MVP Backlog</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="section-toolbar">
                    <div>
                      <h2>{decomposition.projectName}</h2>
                      <p>
                        {stories.length} stories · {totalPoints} estimated points
                        {view === "criteria" && ` · ${stories.reduce((s, st) => s + st.acceptanceCriteria.length, 0)} scenarios`}
                      </p>
                    </div>

                    {view === "backlog" ? (
                      <label className="domain-filter">
                        Domain Filter:
                        <select value={domain} onChange={(e) => setDomain(e.target.value)}>
                          <option value="all">All domains</option>
                          {Object.entries(DOMAINS).map(([id, label]) => (
                            <option value={id} key={id}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <button
                        className="secondary-button"
                        onClick={() =>
                          copy(
                            stories
                              .map(
                                (story) =>
                                  `Feature: ${story.title}\n${story.narrative}\n\n${story.acceptanceCriteria
                                    .map((criterion, index) => `Scenario: Case ${index + 1}\n${criterion}`)
                                    .join("\n\n")}`
                              )
                              .join("\n\n"),
                            "all"
                          )
                        }
                      >
                        <Copy size={15} />
                        <span>{copiedId === "all" ? "Copied!" : "Copy all scenarios"}</span>
                      </button>
                    )}
                  </div>

                  {decomposition.criticalPathNotice && (
                    <div className="notice">
                      <strong>Dependency Graph Analysis:</strong>
                      <p>{decomposition.criticalPathNotice}</p>
                    </div>
                  )}

                  {view === "backlog" ? (
                    <TaskBoard
                      accountEmail={account.email}
                      backlog={decomposition}
                      allocation={allocation}
                      domain={domain}
                    />
                  ) : (
                    <div className="epics-grid">
                      {decomposition.epics.map((epic, epicIndex) => {
                        const visible = epic.stories.filter(
                          (story) => view === "criteria" || domain === "all" || story.domainTag === domain
                        );
                        if (!visible.length) return null;
                        return (
                          <section className="epic-section" key={epicIndex} aria-label={epic.epicTitle}>
                            <div className="epic-heading">
                              <span>{String(epicIndex + 1).padStart(2, "0")}</span>
                              <div>
                                <h3>{epic.epicTitle}</h3>
                                <p>{epic.description}</p>
                              </div>
                              <span>{visible.length} stories</span>
                            </div>

                            <div className="story-grid">
                              {visible.map((story) => (
                                <article className="story-row" key={story.id}>
                                  <div className="story-card-top">
                                    <span className="story-domain">{DOMAINS[story.domainTag]}</span>
                                    <span className="story-points">{story.storyPoints} pts</span>
                                  </div>
                                  <div className="story-heading">
                                    <h4>{story.title}</h4>
                                  </div>
                                  <span className="epic-card-label">{epic.epicTitle}</span>
                                  <p className="story-narrative">{story.narrative}</p>

                                  <div className="criteria-block">
                                    <div className="criteria-heading">
                                      <strong>Gherkin Scenarios:</strong>
                                      <button
                                        className="icon-button"
                                        title="Copy story criteria"
                                        onClick={() => copy(story.acceptanceCriteria.join("\n"), story.id)}
                                      >
                                        <Copy size={13} />
                                        <span>{copiedId === story.id ? "Copied" : "Copy"}</span>
                                      </button>
                                    </div>
                                    {story.acceptanceCriteria.map((c, i) => (
                                      <p key={i}>
                                        <span className="scenario-number">0{i + 1}</span>
                                        <span>{c}</span>
                                      </p>
                                    ))}
                                  </div>
                                </article>
                              ))}
                            </div>
                          </section>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>

      <div className="member-modal-theme">
        <TeamMemberModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          initialMember={editingMember}
          onSave={(member) =>
            saveMembers(
              editingMember
                ? members.map((existing) => (existing.userId === member.userId ? member : existing))
                : [...members, member]
            )
          }
          onDelete={(id) => saveMembers(members.filter((member) => member.userId !== id))}
        />
      </div>
    </div>
  );
}
"""

with open(r"c:\Users\PLP\Music\Scrum stuff mine\components\ScrumWorkspace.tsx", "w", encoding="utf-8") as f:
    f.write(workspace_code)
print("Updated components/ScrumWorkspace.tsx with full overhaul")
