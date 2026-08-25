import { Service, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { Task } from '../interfaces/task';


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
            contacts:ContactList (*)
        )
        `);
        console.log('data:', data)
        if (error) {
            console.error(error);
            return;
        }
        this.tasks.set(data);
    }
}
