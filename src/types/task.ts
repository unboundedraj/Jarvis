export type TaskNote = {
  id: string;
  note: string;
  createdAt: string;
};

export type TaskTag = string;

export type Task = {
  id: string;
  task: string;
  deadline?: string;
  expectedTimeHours: 0.5 | 0.75 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 7;
  tags: TaskTag[];
  notes: TaskNote[];
  createdAt: string;
  updatedAt: string;
};

export type TaskDraft = {
  task: string;
  deadline: string;
  expectedTimeHours: Task["expectedTimeHours"];
  tagsText: string;
  note: string;
};
