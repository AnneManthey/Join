
export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

import { Contact } from "./contact";

export interface Subtask {
    id: string;
    task_id: string;
    title: string;
    done: boolean;
}

export interface TaskContact {
    contact_id: string;
    contacts: Contact;
}

export interface Task {
    id: string;
    title: string;
    description: string | null;
    due_date: string;
    priority: 'low' | 'medium' | 'urgent';
    category: 'technical_task' | 'user_story';
    status: 'todo' | 'in_progress' | 'await_feedback' | 'done';
    subtasks: Subtask[];
    task_contacts: TaskContact[];
}