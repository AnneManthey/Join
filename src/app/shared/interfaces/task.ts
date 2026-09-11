/** Represents a board column and the tasks assigned to it. */
export interface Column {
    id: string;
    title: string;
    tasks: Task[];
}

import { Contact } from "./contact";

/** Represents a subtask belonging to a parent task. */
export interface Subtask {
    id: number;
    task_id: number;
    title: string;
    done: boolean;
}

/** Represents a contact assigned to a task. */
export interface TaskContact {
    contact_id: number;
    contacts: Contact;
}

/** Represents a task and its related subtasks and contacts. */
export interface Task {
    id: number;
    title: string;
    description: string | null;
    due_date: string;
    priority: 'low' | 'medium' | 'urgent';
    category: 'technical_task' | 'user_story';
    status: 'todo' | 'in_progress' | 'await_feedback' | 'done';
    subtasks: Subtask[];
    task_contacts: TaskContact[];
}