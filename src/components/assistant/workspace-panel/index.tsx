"use client";

import { useEffect, useMemo, useState } from "react";
import { useFocusMode } from "@/components/assistant/focus-mode/provider";
import { orbitron } from "@/lib/fonts";
import { type Task, type TaskDraft } from "@/types/task";
import { TaskDialog } from "./task-dialog";
import { TaskNoteDialog } from "./task-note-dialog";
import { TaskRow } from "./task-row";

const WORKSPACE_TASKS_REPLACED_EVENT = "workspace:tasks-replaced";

const INITIAL_DRAFT: TaskDraft = {
  task: "",
  deadline: "",
  expectedTimeHours: 1,
  tagsText: "",
  note: "",
};

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function parseTags(text: string) {
  return text
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatExpectedTime(hours: Task["expectedTimeHours"]) {
  if (hours === 0.75) {
    return "45 mins";
  }

  if (hours === 1) {
    return "1 hr";
  }

  return `${hours} hrs`;
}

export function WorkspacePanel() {
  const { startFocusMode } = useFocusMode();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskDraft, setTaskDraft] = useState<TaskDraft>(INITIAL_DRAFT);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");

  useEffect(() => {
    const fetchWorkspaceState = async () => {
      try {
        const response = await fetch("/api/sync/workspace", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { tasks?: Task[] };
        if (Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        }
      } catch {
        // Keep local-first behavior if API is unavailable.
      }
    };

    void fetchWorkspaceState();
  }, []);

  useEffect(() => {
    const handleTasksReplaced = (event: Event) => {
      const customEvent = event as CustomEvent<{ tasks?: Task[] }>;
      const nextTasks = customEvent.detail?.tasks;

      if (!Array.isArray(nextTasks)) {
        return;
      }

      setTasks(nextTasks);
    };

    window.addEventListener(WORKSPACE_TASKS_REPLACED_EVENT, handleTasksReplaced);

    return () => {
      window.removeEventListener(WORKSPACE_TASKS_REPLACED_EVENT, handleTasksReplaced);
    };
  }, []);

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? null,
    [activeTaskId, tasks],
  );

  const openTaskDialog = () => {
    setTaskDraft(INITIAL_DRAFT);
    setIsTaskDialogOpen(true);
  };

  const closeTaskDialog = () => {
    setIsTaskDialogOpen(false);
  };

  const syncTasks = async (nextTasks: Task[]) => {
    setSyncStatus("syncing");

    try {
      const response = await fetch("/api/sync/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: nextTasks }),
      });

      if (!response.ok) {
        throw new Error("Sync failed");
      }

      setSyncStatus("synced");
      return true;
    } catch {
      setSyncStatus("error");
      return false;
    }
  };

  const addTask = async () => {
    if (!taskDraft.task.trim()) {
      return;
    }

    const previousTasks = tasks;
    const tags = parseTags(taskDraft.tagsText);
    const now = new Date().toISOString();
    const noteText = taskDraft.note.trim();

    const nextTask: Task = {
      id: createId(),
      task: taskDraft.task.trim(),
      deadline: taskDraft.deadline || undefined,
      expectedTimeHours: taskDraft.expectedTimeHours,
      tags,
      notes: noteText
        ? [
            {
              id: createId(),
              note: noteText,
              createdAt: now,
            },
          ]
        : [],
      createdAt: now,
      updatedAt: now,
    };

    const nextTasks = [nextTask, ...previousTasks];

    setTasks(nextTasks);

    const saved = await syncTasks(nextTasks);

    if (saved) {
      setIsTaskDialogOpen(false);
      return;
    }

    setTasks(previousTasks);
  };

  const openNoteDialog = (taskId: string) => {
    setActiveTaskId(taskId);
    setNoteDraft("");
  };

  const closeNoteDialog = () => {
    setActiveTaskId(null);
    setNoteDraft("");
  };

  const addNoteToTask = async () => {
    if (!activeTask || !noteDraft.trim()) {
      return;
    }

    const previousTasks = tasks;
    const now = new Date().toISOString();
    const newNote = {
      id: createId(),
      note: noteDraft.trim(),
      createdAt: now,
    };

    const nextTasks = tasks.map((task) =>
      task.id === activeTask.id
        ? { ...task, notes: [...task.notes, newNote], updatedAt: now }
        : task,
    );

    setTasks(nextTasks);

    const saved = await syncTasks(nextTasks);

    if (saved) {
      closeNoteDialog();
      return;
    }

    setTasks(previousTasks);
  };

  const completeTask = async (taskId: string) => {
    const previousTasks = tasks;
    const nextTasks = previousTasks.filter((task) => task.id !== taskId);
    const previousActiveTaskId = activeTaskId;
    const previousNoteDraft = noteDraft;

    setTasks(nextTasks);

    const saved = await syncTasks(nextTasks);

    if (saved) {
      if (previousActiveTaskId === taskId) {
        setActiveTaskId(null);
        setNoteDraft("");
      }
      return;
    }

    setTasks(previousTasks);
    setActiveTaskId(previousActiveTaskId);
    setNoteDraft(previousNoteDraft);
  };

  const startTaskFocusMode = (taskId: string) => {
    const targetTask = tasks.find((task) => task.id === taskId);

    if (!targetTask) {
      return;
    }

    startFocusMode({
      taskName: targetTask.task,
      deadline: targetTask.deadline,
      expectedTime: formatExpectedTime(targetTask.expectedTimeHours),
      tags: targetTask.tags,
      notes: targetTask.notes.map((note) => note.note).join(" | "),
      onSessionEnd: async (wasSuccessful) => {
        if (wasSuccessful) {
          await completeTask(targetTask.id);
        }
      },
    });
  };

  const syncWorkspace = async () => {
    await syncTasks(tasks);
  };

  return (
    <section className="flex h-full min-h-0 flex-col gap-2 overflow-hidden rounded-2xl border border-border bg-surface p-3 text-center sm:p-4">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <h2
          className={`${orbitron.className} text-sm font-semibold uppercase tracking-widest text-brand sm:text-base`}
        >
          Workspace
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openTaskDialog}
            className="rounded-lg border border-brand bg-brand px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-brand-contrast transition hover:opacity-90"
          >
            Add Task
          </button>
          <button
            type="button"
            onClick={syncWorkspace}
            className="rounded-lg border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-text-soft transition hover:border-white hover:text-white"
          >
            Sync
          </button>
        </div>
      </div>

      <p className="shrink-0 text-right text-[10px] uppercase tracking-[0.18em] text-text-soft">
        {syncStatus === "syncing" && "Syncing..."}
        {syncStatus === "synced" && "Synced"}
        {syncStatus === "error" && "Sync failed"}
        {syncStatus === "idle" && ""}
      </p>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-auto pr-1 text-left">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onAddNote={openNoteDialog}
              onFocus={startTaskFocusMode}
              onComplete={completeTask}
            />
          ))
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border p-4 text-center text-xs uppercase tracking-[0.18em] text-text-soft">
            No tasks yet. Add one to begin.
          </div>
        )}
      </div>

      <TaskDialog
        draft={taskDraft}
        isOpen={isTaskDialogOpen}
        onClose={closeTaskDialog}
        onDraftChange={setTaskDraft}
        onSubmit={addTask}
      />

      <TaskNoteDialog
        taskTitle={activeTask?.task ?? ""}
        note={noteDraft}
        isOpen={activeTask !== null}
        onClose={closeNoteDialog}
        onNoteChange={setNoteDraft}
        onSubmit={addNoteToTask}
      />
    </section>
  );
}
