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
            contact_id,
            contacts:ContactList (*)
        )
        `);
        console.log('data:', data)
        if (error) {
            console.error(error);
            return;
        }
        this.tasks.set(data ?? []);
    }

    
    async setStatus(status: Task['status'], taskId: number): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('tasks')
            .update({ status: status })
            .eq('id', taskId)
            .select()
        if (error) {
            console.error('Status konnte nicht geändert werden:', error.message);
            return false;
        }

        return true;
    }
}


// Musste ich anpassen, damit alle columns gerendered werden:

//alt:
// task_contacts (
//             ContactList (*)
//         )

//neu:
// task_contacts (
//             contact_id,
//             contacts:ContactList (*)
//         )