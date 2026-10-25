"use client";

import { useEffect, useState } from "react";
import { accountStorageKey } from "@/lib/account-storage";
import { CheckCircle2, Columns3, Users, Clock, Tag, ArrowRightCircle, Sparkles, AlertCircle, Layers } from "lucide-react";
import type { BacklogDecompositionResponse, WorkloadAllocationResult, DomainTag } from "@/types/scrum";

const COLUMNS = [
  { id: "not-started", label: "Not started", color: "#64748b", bg: "#f8fafc", border: "#e2e8f0", badge: "#f1f5f9" },
  { id: "in-progress", label: "In progress", color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd", badge: "#e0f2fe" },
  { id: "pending", label: "Pending", color: "#d97706", bg: "#fffbeb", border: "#fde68a", badge: "#fef3c7" },
  { id: "completed", label: "Completed", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", badge: "#dcfce7" },
] as const;

type Status = typeof COLUMNS[number]["id"];

const DOMAIN_CONFIG: Record<DomainTag, { label: string; text: string; bg: string; border: string }> = {
  frontend: { label: "Frontend", text: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" },
  backend: { label: "Backend", text: "#4338ca", bg: "#eef2ff", border: "#c7d2fe" },
  database: { label: "Database", text: "#7e22ce", bg: "#faf5ff", border: "#e9d5ff" },
  devops: { label: "DevOps", text: "#047857", bg: "#ecfdf5", border: "#a7f3d0" },
  qa: { label: "QA & Testing", text: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  docs: { label: "Docs", text: "#475569", bg: "#f8fafc", border: "#e2e8f0" },
};

function formatGherkin(criterion: string) {
  // Highlight Given, When, Then, And keywords
  const parts = criterion.split(/\b(Given|When|Then|And)\b/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (["Given", "When", "Then", "And"].includes(part)) {
          return (
            <strong key={i} className="gherkin-keyword">
              {part}{" "}
            </strong>
          );
        }
        return part;
      })}
    </span>
  );
}

export default function TaskBoard({
  backlog,
  allocation,
  domain,
  accountEmail,
}: {
  backlog: BacklogDecompositionResponse;
  allocation: WorkloadAllocationResult | null;
  domain: string;
  accountEmail: string;
}) {
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [saveError, setSaveError] = useState("");
  
  const storageKey = accountStorageKey(
    accountEmail,
    `statuses:${JSON.stringify([
      backlog.projectName,
      backlog.epics.flatMap((epic) => epic.stories.map((story) => story.id)),
    ])}`
  );

  useEffect(() => {
    setStatuses({});
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(storageKey) || "{}");
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        const valid: Record<string, Status> = {};
        for (const [id, value] of Object.entries(saved)) {
          const column = COLUMNS.find((item) => item.id === value);
          if (column) valid[id] = column.id;
        }
        setStatuses(valid);
      }
    } catch {
      setSaveError("Saved task statuses could not be loaded.");
    }
  }, [storageKey]);

  function moveStory(id: string, status: Status) {
    const next = { ...statuses, [id]: status };
    setStatuses(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSaveError("");
    } catch {
      setSaveError("Status changed for this session, but could not be saved on this device.");
    }
  }

  const tasks = backlog.epics
    .flatMap((epic) => epic.stories.map((story) => ({ ...story, epic: epic.epicTitle })))
    .filter((story) => domain === "all" || story.domainTag === domain);

  return (
    <div className="task-board-view">
      <div className="board-view-header-row">
        <div className="board-view-title-group">
          <Columns3 size={18} className="board-title-icon" />
          <h2>Sprint Kanban Board</h2>
          <span className="board-stats-pill">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} {domain !== "all" && `(${domain})`}
          </span>
        </div>
        <p className="board-instruction">Select a card's status to move it between sprint lanes</p>
      </div>

      {saveError && (
        <div className="workspace-error" role="alert">
          <AlertCircle size={16} />
          <span>{saveError}</span>
        </div>
      )}

      <div className="task-board" aria-label="Tasks by status">
        {COLUMNS.map((column) => {
          const cards = tasks.filter((story) => (statuses[story.id] || "not-started") === column.id);
          return (
            <section
              key={column.id}
              className={`task-column status-${column.id}`}
              aria-label={`${column.label} tasks`}
            >
              <header className="task-column-heading">
                <div className="column-header-left">
                  <span className="column-status-dot" style={{ background: column.color }} />
                  <h3>{column.label}</h3>
                </div>
                <span className="column-count-badge">{cards.length}</span>
              </header>

              <div className="task-column-cards">
                {cards.map((story) => {
                  const owner = allocation?.allocations.find((member) =>
                    member.assignedStoryIds.includes(story.id)
                  );
                  const domainConfig = DOMAIN_CONFIG[story.domainTag] || {
                    label: story.domainTag,
                    text: "#475569",
                    bg: "#f8fafc",
                    border: "#e2e8f0",
                  };

                  return (
                    <article className="task-card" key={story.id}>
                      <div className="task-card-top-tags">
                        <span
                          className="domain-micro-pill"
                          style={{
                            color: domainConfig.text,
                            backgroundColor: domainConfig.bg,
                            borderColor: domainConfig.border,
                          }}
                        >
                          {domainConfig.label}
                        </span>

                        <span className="story-points-pill">
                          <Clock size={11} />
                          {story.storyPoints} {story.storyPoints === 1 ? "pt" : "pts"}
                        </span>
                      </div>

                      <h4 className="task-card-title">
                        <CheckCircle2 size={16} aria-hidden="true" />
                        <span>{story.title}</span>
                      </h4>

                      <div className="task-card-owner-line">
                        <div className="owner-avatar-chip">
                          <span className="owner-avatar-dot" />
                          <Users size={13} />
                          <span>{owner?.name || "Unassigned proposal"}</span>
                        </div>
                      </div>

                      <div className="task-status-row">
                        <label className="task-status-label">
                          <span className="sr-only">Status for {story.title}</span>
                          <select
                            value={statuses[story.id] || "not-started"}
                            onChange={(event) => {
                              const next = COLUMNS.find((item) => item.id === event.target.value);
                              if (next) moveStory(story.id, next.id);
                            }}
                          >
                            {COLUMNS.map((item) => (
                              <option key={item.id} value={item.id}>
                                Move to: {item.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <details className="task-card-details">
                        <summary>Story &amp; Acceptance Criteria ({story.acceptanceCriteria.length})</summary>
                        <div className="details-expanded-body">
                          <div className="task-epic-tag">
                            <Layers size={13} />
                            <span>Epic: {story.epic}</span>
                          </div>
                          
                          <p className="story-narrative-text">{story.narrative}</p>

                          {story.dependencies.length > 0 && (
                            <div className="story-dependencies-box">
                              <strong>Prerequisites:</strong>
                              <span>
                                {story.dependencies
                                  .map(
                                    (depId) =>
                                      backlog.epics
                                        .flatMap((e) => e.stories)
                                        .find((item) => item.id === depId)?.title || depId
                                  )
                                  .join(", ")}
                              </span>
                            </div>
                          )}

                          <div className="criteria-list-wrapper">
                            <span className="criteria-list-title">Acceptance Criteria (Gherkin):</span>
                            <ul>
                              {story.acceptanceCriteria.map((criterion, index) => (
                                <li key={index}>{formatGherkin(criterion)}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </details>
                    </article>
                  );
                })}

                {!cards.length && (
                  <div className="task-column-empty-state">
                    <span>No tasks in this lane</span>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
"""

with open(r"c:\Users\PLP\Music\Scrum stuff mine\components\TaskBoard.tsx", "w", encoding="utf-8") as f:
    f.write(task_board_code)
print("Updated components/TaskBoard.tsx")
