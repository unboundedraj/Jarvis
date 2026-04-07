export type AppRoute = "/" | "/assistant";

export type { AssistantProfile, EnergyLevel } from "./assistant";
export type {
	MonthlyFrequency,
	RepetitiveFrequency,
	RepetitiveTask,
	Task,
	TaskDraft,
	TaskNote,
	TaskTag,
	WeekdayFrequency,
	WorkspaceTask,
} from "./task";
export type { StickyNote } from "./notice-board";
