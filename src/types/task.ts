export type TaskNote = {
  id: string;
  note: string;
  createdAt: string;
};

export type TaskTag = string;

export type WeekdayFrequency =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type MonthlyFrequency = "monthly-1" | "monthly-15" | "monthly-30";

export type RepetitiveFrequency =
  | WeekdayFrequency
  | MonthlyFrequency;

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

export type RepetitiveTask = Task & {
  frequency: RepetitiveFrequency[];
  lastCompletedOn?: string;
};

export type WorkspaceTask = Task | RepetitiveTask;

export type TaskDraft = {
  task: string;
  deadline: string;
  expectedTimeHours: Task["expectedTimeHours"];
  tagsText: string;
  note: string;
  isRepetitive: boolean;
  repetitiveWeekdays: WeekdayFrequency[];
  repetitiveMonthlyFrequency: MonthlyFrequency | "";
};
