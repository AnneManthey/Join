import { Service, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { Task } from '../interfaces/task';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Subtask, TaskContact } from '../interfaces/task';
import { AbstractControl, ValidationErrors, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Service()
/**
 * Handles task-related persistence and real-time synchronization with Supabase.
 * This service manages tasks, subtasks, and task-to-contact assignments and keeps
 * Angular signals in sync with the database.
 */
export class SupabaseTaskService {
    private supabaseService = inject(SupabaseService);

    private supabase = this.supabaseService.client;
    tasks = signal<Task[]>([]);

    private tasksInsertChannel!: RealtimeChannel;
    private tasksUpdateChannel!: RealtimeChannel;
    private tasksDeleteChannel!: RealtimeChannel;
    private subtasksInsertChannel!: RealtimeChannel;
    private subtasksUpdateChannel!: RealtimeChannel;
    private subtasksDeleteChannel!: RealtimeChannel;
    private taskContactsInsertChannel!: RealtimeChannel;
    private taskContactsUpdateChannel!: RealtimeChannel;
    private taskContactsDeleteChannel!: RealtimeChannel;
    currentTaskId!: number;
    selectedContacts = signal<number[]>([]);
    assignedSubtasks = signal<string[]>([]);


    /** Initializes the service and starts loading tasks and realtime subscriptions. */
    constructor() {
        this.subscribeToChanges();
        this.getTasks();
    }

    /**
     * Loads all task records together with their nested subtasks and assigned contacts.
     * The result is stored in the tasks signal for the UI to consume.
     */
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

    /** Removes all realtime channels when the service is destroyed. */
    ngOnDestroy(): void {
        this.supabase.removeChannel(this.tasksInsertChannel);
        this.supabase.removeChannel(this.tasksUpdateChannel);
        this.supabase.removeChannel(this.tasksDeleteChannel);
        this.supabase.removeChannel(this.subtasksInsertChannel);
        this.supabase.removeChannel(this.subtasksUpdateChannel);
        this.supabase.removeChannel(this.subtasksDeleteChannel);
        this.supabase.removeChannel(this.taskContactsInsertChannel);
        this.supabase.removeChannel(this.taskContactsUpdateChannel);
        this.supabase.removeChannel(this.taskContactsDeleteChannel);
    }

    /**
     * Updates the status of a task in the database.
     *
     * @param status The new task status.
     * @param taskId The ID of the task to update.
     * @returns Whether the status update succeeded.
     */
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


    /**
     * Inserts one or more new subtasks to an existing task.
     *
     * @param taskId The task id that receives the subtasks.
     * @param newSubtaskTitles The titles of the subtasks to create.
     * @returns True when the insert succeeds, otherwise false.
     */
    // async addNewSubtasks(taskId: number, newSubtaskTitles: string[]): Promise<boolean> {
    //     if (newSubtaskTitles.length === 0) {
    //         return true;
    //     }

    //     const insertRows = newSubtaskTitles.map(title => ({
    //         task_id: taskId,
    //         title: title
    //     }));

    //     const { error } = await this.supabase
    //         .from('subtasks')
    //         .insert(insertRows);

    //     if (error) {
    //         console.error('Subtasks could not be added', error.message);
    //         return false;
    //     }

    //     return true;
    // }
    async addNewSubtasks(taskId: number, newSubtaskTitles: string[]): Promise<boolean> {
        const currentTask = this.tasks().find(t => t.id === taskId);
        const oldTitles = currentTask?.subtasks.map(s => s.title) ?? [];

        const toAdd = newSubtaskTitles.filter(title => !oldTitles.includes(title));
        const toRemove = oldTitles.filter(title => !newSubtaskTitles.includes(title));

        if (toRemove.length > 0) {
            const { error } = await this.supabase.from('subtasks')
                .delete().eq('task_id', taskId).in('title', toRemove);
            if (error) { console.error('Subtasks could not be removed', error.message); return false; }
        }

        if (toAdd.length > 0) {
            const { error } = await this.supabase.from('subtasks')
                .insert(toAdd.map(title => ({ task_id: taskId, title })));
            if (error) { console.error('Subtasks could not be added', error.message); return false; }
        }

        return true;
    }

    /**
     * Replaces the task's current contact assignments with a new contact list.
     *
     * @param taskId The task whose contact assignments are being updated.
     * @param newIds The complete set of contact ids assigned to the task.
     * @returns True when the update succeeds, otherwise false.
     */
    async updateAssignedContacts(taskId: number, newIds: number[]): Promise<boolean> {
        const currentTask = this.tasks().find(t => t.id === taskId);
        const oldIds = currentTask?.task_contacts.map(tc => tc.contact_id) ?? [];

        const toAdd = newIds.filter(id => !oldIds.includes(id)).map(contact_id => ({ task_id: taskId, contact_id }));
        const toRemove = oldIds.filter(id => !newIds.includes(id));

        if (toRemove.length > 0) {
            const { error } = await this.supabase.from('task_contacts').delete().eq('task_id', taskId).in('contact_id', toRemove);
            if (error) { console.error('Contacts could not be removed', error.message); return false; }
        }

        if (toAdd.length > 0) {
            const { error } = await this.supabase.from('task_contacts').insert(toAdd);
            if (error) { console.error('Contacts could not be added', error.message); return false; }
        }

        return true;
    }

    /**
     * Updates selected fields of an existing task.
     *
     * @param taskId The task id to update.
     * @param updatedTask The partial task payload with the updated values.
     * @returns True when the task update succeeds, otherwise false.
     */
    async editTask(taskId: number, updatedTask: Partial<Task>) {
        const { data, error } = await this.supabase
            .from('tasks')
            .update(updatedTask)
            .eq('id', taskId)
            .select()

        if (error) {
            console.error('Task could not be updated', error.message);
            return false;
        }
        return true;
    }

    /**
     * Deletes a task from the database by its unique identifier.
     *
     * @param taskId The unique numeric ID of the task to delete.
     * @returns True if the task was successfully deleted, otherwise false.
     */
    async deleteTask(taskId: number) {
        const { error } = await this.supabase
            .from('tasks')
            .delete()
            .eq('id', taskId)

        if (error) {
            console.error('Task could not be deleted', error.message);
            return false;
        }
        return true;
    }

    /**
     * Removes a subtask from the local edit list at the given index.
     *
     * @param index The zero-based index of the subtask to delete.
     */
    deleteEditSubtask(index: number) {
        this.assignedSubtasks.update(subtasks => subtasks.filter((_, i) => i !== index));
    }

    /**
 * Updates the text content of a subtask in the current edit list.
 *
 * @param index The zero-based index of the subtask to update.
 * @param newSubtask The new text content for the subtask.
 */
    updateEditSubtask(index: number, newSubtask: string) {
        const newText = newSubtask.trim();
        if (!newText) return;
        this.assignedSubtasks.update(subtasks => subtasks.map((task, i) => i === index ? newText : task));
    }

    /**
     * Adds or removes a contact from the temporary selection list based on a checkbox event.
     *
     * @param contactId The unique identifier of the contact to toggle.
     * @param event The change event triggered by the checkbox.
     */
    toggleSelectedContact(contactId: number, event: Event) {
        const checked = (event.target as HTMLInputElement).checked;
        if (checked) {
            this.selectedContacts.update(ids => [...ids, contactId])
        } else {
            this.selectedContacts.update(ids => ids.filter(contact => contact !== contactId));
        }
    }

    /**
     * Saves the selected contacts for a newly created task in the task_contacts table.
     *
     * @param taskId The id of the newly created task.
     * @returns True if the contacts were saved successfully, otherwise false.
     */
    async saveTaskContacts(taskId: number): Promise<boolean> {
        const insertContacts = this.selectedContacts().map(contactId => ({
            task_id: taskId,
            contact_id: contactId
        }));
        const { error } = await this.supabase
            .from('task_contacts')
            .insert(insertContacts)
            .select();
        if (error) {
            console.error('No contacts received');
            return false;
        }
        this.selectedContacts.set([]);
        return true;
    }

    /**
     * Saves all subtasks assigned to a newly created task.
     *
     * @param taskId The id of the newly created task.
     * @returns True if the subtasks were saved successfully, otherwise false.
     */
    async saveTaskSubtasks(taskId: number): Promise<boolean> {
        const insertSubtasks = this.assignedSubtasks().map(subtask => ({
            task_id: taskId,
            title: subtask,
        }));
        const { error } = await this.supabase
            .from('subtasks')
            .insert(insertSubtasks)
            .select();
        if (error) {
            console.error('No subtasks recieved');
            return false;
        }
        this.assignedSubtasks.set([]);
        return true;
    }

    /**
     * Creates the main task record in Supabase using the provided task data.
     *
     * @param taskData The task fields required to create a new task.
     * @returns The created task id, or null if the insert failed.
     */
    async createTask(taskData: {
        title: string;
        description: string;
        due_date: string;
        priority: Task['priority'];
        category: Task['category'];
        status: Task['status'];
    }): Promise<number | null> {
        const { data, error } = await this.supabase
            .from('tasks')
            .insert([taskData])
            .select();
        if (error) {
            console.error('No data received');
            return null;
        }
        const taskId = data?.[0]?.id;
        if (!taskId) {
            console.error('task id not found');
            return null;
        }
        return taskId;
    }

    /**
     * Toggles the completion state of a subtask and syncs the local tasks signal
     * with the value stored in Supabase.
     *
     * @param subtaskId The id of the subtask to update.
     * @param done The new completion state.
     */
    async toggleSubtask(subtaskId: Subtask['id'], done: boolean): Promise<void> {
        this.setSubtaskDone(subtaskId, done);

        const { data, error } = await this.supabase
            .from('subtasks')
            .update({ done })
            .eq('id', subtaskId)
            .select();

        if (error || !data || data.length === 0) {
            console.error(error ?? 'Update did not change anything (check RLS-Policy).');
            this.setSubtaskDone(subtaskId, !done);
        }
    }

    private setSubtaskDone(subtaskId: Subtask['id'], done: boolean): void {
        this.tasks.update(tasks =>
            tasks.map(task => ({
                ...task,
                subtasks: task.subtasks.map(subtask =>
                    subtask.id === subtaskId ? { ...subtask, done } : subtask
                )
            }))
        );
    }
}