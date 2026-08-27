import { Service, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { Task } from '../interfaces/task';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Subtask, TaskContact } from '../interfaces/task';


@Service()
export class SupabaseTaskService {
    private supabaseService = inject(SupabaseService);
    private supabase = this.supabaseService.client;
    tasks = signal<Task[]>([]);

    private tasksInsertChannel: RealtimeChannel | undefined;
    private tasksUpdateChannel: RealtimeChannel | undefined;
    private tasksDeleteChannel: RealtimeChannel | undefined;
    private subtasksInsertChannel: RealtimeChannel | undefined;
    private subtasksUpdateChannel: RealtimeChannel | undefined;
    private subtasksDeleteChannel: RealtimeChannel | undefined;
    private taskContactsInsertChannel: RealtimeChannel | undefined;
    private taskContactsUpdateChannel: RealtimeChannel | undefined;
    private taskContactsDeleteChannel: RealtimeChannel | undefined;

    /** Initializes the service and starts loading tasks and realtime subscriptions. */
    constructor() {
        console.log('Service initialisiert');
        this.subscribeToChanges();
        this.getTasks();
    }

    /** Loads all tasks together with their subtasks and assigned contacts. */
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

    /** Starts all realtime subscriptions used by the task service. */
    subscribeToChanges(): void {
        this.subscribeToTasks();
        this.subscribeToSubtasks();
        this.subscribeToTaskContacts();
    }

    /** Starts the realtime subscriptions for tasks. */
    subscribeToTasks(): void {
        this.subscribeToTasksInsert();
        this.subscribeToTasksUpdate();
        this.subscribeToTasksDelete();
    }

    /** Subscribes to newly inserted tasks. */
    subscribeToTasksInsert(): void {
        this.tasksInsertChannel = this.supabase.channel('tasks-insert-channel')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'tasks' },
                (payload) => {
                    const newTask: Task = { ...payload.new as Task, subtasks: [], task_contacts: [] };
                    this.tasks.update(list => [...list, newTask]);
                }
            )
            .subscribe();
    }

    /** Subscribes to updates of existing tasks. */
    subscribeToTasksUpdate(): void {
        this.tasksUpdateChannel = this.supabase.channel('tasks-update-channel')
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'tasks' },
                (payload) => {
                    this.tasks.update(list =>
                        list.map(task =>
                            task.id === payload.new['id']
                                ? { ...task, ...payload.new as Partial<Task> }
                                : task
                        )
                    );
                }
            )
            .subscribe();
    }

    /** Subscribes to deleted tasks. */
    subscribeToTasksDelete(): void {
        this.tasksDeleteChannel = this.supabase.channel('tasks-delete-channel')
            .on('postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'tasks' },
                (payload) => {
                    const deletedId = payload.old['id'];
                    this.tasks.update(list => list.filter(task => task.id !== deletedId));
                }
            )
            .subscribe();
    }

    /** Starts the realtime subscriptions for subtasks. */
    subscribeToSubtasks(): void {
        this.subscribeToSubtasksInsert();
        this.subscribeToSubtasksUpdate();
        this.subscribeToSubtasksDelete();
    }

    /** Subscribes to newly inserted subtasks. */
    subscribeToSubtasksInsert(): void {
        this.subtasksInsertChannel = this.supabase.channel('subtasks-insert-channel')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'subtasks' },
                (payload) => {
                    const newSubtask = payload.new as Subtask;
                    this.tasks.update(list =>
                        list.map(task =>
                            task.id === newSubtask.task_id
                                ? { ...task, subtasks: [...task.subtasks, newSubtask] }
                                : task
                        )
                    );
                }
            )
            .subscribe();
    }

    /** Subscribes to updates of existing subtasks. */
    subscribeToSubtasksUpdate(): void {
        this.subtasksUpdateChannel = this.supabase.channel('subtasks-update-channel')
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'subtasks' },
                (payload) => {
                    const updatedSubtask = payload.new as Subtask;
                    this.tasks.update(list =>
                        list.map(task =>
                            task.id === updatedSubtask.task_id
                                ? {
                                    ...task,
                                    subtasks: task.subtasks.map(st =>
                                        st.id === updatedSubtask.id ? updatedSubtask : st
                                    )
                                }
                                : task
                        )
                    );
                }
            )
            .subscribe();
    }

    /** Subscribes to deleted subtasks. */
    subscribeToSubtasksDelete(): void {
        this.subtasksDeleteChannel = this.supabase.channel('subtasks-delete-channel')
            .on('postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'subtasks' },
                (payload) => {
                    const deletedId = payload.old['id'];
                    const deletedTaskId = payload.old['task_id'];
                    this.tasks.update(list =>
                        list.map(task =>
                            task.id === deletedTaskId
                                ? { ...task, subtasks: task.subtasks.filter(st => st.id !== deletedId) }
                                : task
                        )
                    );
                }
            )
            .subscribe();
    }

    /** Starts the realtime subscriptions for task-contact assignments. */
    subscribeToTaskContacts(): void {
        this.subscribeToTaskContactsInsert();
        this.subscribeToTaskContactsUpdate();
        this.subscribeToTaskContactsDelete();
    }

    /** Subscribes to newly created task-contact assignments. */
    subscribeToTaskContactsInsert(): void {
        this.taskContactsInsertChannel = this.supabase.channel('task-contacts-insert-channel')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'task_contacts' },
                (payload) => {
                    const taskId = payload.new['task_id'];
                    const contactId = payload.new['contact_id'];

                    const contact = this.supabaseService.contacts().find(c => c.id === contactId);
                    if (!contact) {
                        console.error('Kontakt nicht in contacts-Liste gefunden:', contactId);
                        return;
                    }
                    const newTaskContact: TaskContact = { contact_id: contactId, contacts: contact };
                    this.tasks.update(list =>
                        list.map(task =>
                            task.id === taskId
                                ? { ...task, task_contacts: [...task.task_contacts, newTaskContact] }
                                : task
                        )
                    );
                }
            )
            .subscribe();
    }

    /** Subscribes to updated task-contact assignments. */
    subscribeToTaskContactsUpdate(): void {
        this.taskContactsUpdateChannel = this.supabase.channel('task-contacts-update-channel')
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'task_contacts' },
                (payload) => {
                    const taskId = payload.new['task_id'];
                    const contactId = payload.new['contact_id'];
                    const contact = this.supabaseService.contacts().find(c => c.id === contactId);
                    if (!contact) {
                        console.error('Kontakt nicht in contacts-Liste gefunden:', contactId);
                        return;
                    }
                    const updatedTaskContact: TaskContact = { contact_id: contactId, contacts: contact };
                    this.tasks.update(list =>
                        list.map(task =>
                            task.id === taskId
                                ? {
                                    ...task,
                                    task_contacts: task.task_contacts.map(tc =>
                                        tc.contact_id === updatedTaskContact.contact_id ? updatedTaskContact : tc
                                    )
                                }
                                : task
                        )
                    );
                }
            )
            .subscribe();
    }

    /** Subscribes to deleted task-contact assignments. */
    subscribeToTaskContactsDelete(): void {
        this.taskContactsDeleteChannel = this.supabase.channel('task-contacts-delete-channel')
            .on('postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'task_contacts' },
                (payload) => {
                    const deletedTaskId = payload.old['task_id'];
                    const deletedContactId = payload.old['contact_id'];

                    this.tasks.update(list =>
                        list.map(task =>
                            task.id === deletedTaskId
                                ? {
                                    ...task,
                                    task_contacts: task.task_contacts.filter(
                                        tc => tc.contact_id !== deletedContactId
                                    )
                                }
                                : task
                        )
                    );
                }
            )
            .subscribe();
    }



    // TaskID als string gesetzt (vorher number), da die an anderer Stelle auch als string deklariert waren und sonst Fehler werfen
    /** Updates the status of a task in the database.
     *
     * @param status The new task status.
     * @param taskId The ID of the task to update.
     * @returns Whether the status update succeeded.
     */
    async setStatus(status: Task['status'], taskId: string): Promise<boolean> {
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