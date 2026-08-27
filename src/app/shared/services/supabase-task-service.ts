import { Service, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { Subtask, Task } from '../interfaces/task';


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
        if (error) {
            console.error(error);
            return;
        }
        this.tasks.set(data ?? []);
    }

    async toggleSubtask(subtaskId: Subtask['id'], done: boolean) {
        // 1. Sofort lokal umschalten, damit die UI ohne Wartezeit reagiert
        const allTasks = this.tasks();
        for (const task of allTasks) {
            for (const subtask of task.subtasks) {
                if (subtask.id === subtaskId) {
                    subtask.done = done;
                }
            }
        }
        this.tasks.set([...allTasks]);

        // 2. Änderung in der Datenbank speichern
        const { data, error } = await this.supabase
            .from('subtasks')
            .update({ done: done })
            .eq('id', subtaskId)
            .select();

        // 3. Falls es fehlschlägt: lokale Änderung wieder rückgängig machen
        if (error || !data || data.length === 0) {
            console.error(error ?? 'Update hat keine Zeile verändert (RLS-Policy prüfen).');

            for (const task of allTasks) {
                for (const subtask of task.subtasks) {
                    if (subtask.id === subtaskId) {
                        subtask.done = !done;
                    }
                }
            }
            this.tasks.set([...allTasks]);
        }
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
