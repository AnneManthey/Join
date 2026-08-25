import { Service, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { Contact } from '../interfaces/contact';

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


@Service()
export class SupabaseTaskService {
    private supabaseService = inject(SupabaseService);
    private supabase = this.supabaseService.client;
    tasks = signal<Task[]>([]);

    async getTasks() {
        const { data, error } = await this.supabase
            .from('tasks')
            .select(`
        *,
        subtasks (*),
        task_contacts (
            ContactList (*)
        )
        `);
        if (error) {
            console.error(error);
            return;
        }
        this.tasks.set(data);
    }
}
