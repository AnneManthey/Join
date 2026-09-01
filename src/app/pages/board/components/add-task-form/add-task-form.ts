import { Component, ElementRef, HostListener, ViewChild, computed, inject, signal, input, output } from '@angular/core';
import { SupabaseTaskService } from '../../../../shared/services/supabase-task-service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../shared/services/supabase-service';
import { Task } from '../../../../shared/interfaces/task';
import { GetInitialsPipe } from '../../../../shared/pipes/get-initials-pipe';
import { getColor } from '../../../../shared/utils/contacts-helper';

@Component({
  selector: 'app-add-task-form',
  imports: [GetInitialsPipe, ReactiveFormsModule],
  templateUrl: './add-task-form.html',
  styleUrl: './add-task-form.scss',
})
export class AddTaskForm {
  private supabaseService = inject(SupabaseService);
  private supabaseTaskService = inject(SupabaseTaskService);
  private supabase = this.supabaseService.client;
  private router = inject(Router);

  @ViewChild('assignedToDropdown') assignedToDropdown?: ElementRef<HTMLElement>;
  contacts = this.supabaseService.contacts;
  selectedContacts = this.supabaseTaskService.selectedContacts;
  assignedSubtasks = this.supabaseTaskService.assignedSubtasks;

  /** Indicates whether the contact selection dropdown menu is open. */
  contactDropdownOpen = signal(false);

  /** Indicates whether the category selector menu is open. */
  isCategoryOpen = false;

  /** Index of the subtask currently being edited, or `null` if no edit is active. */
  editingIndex = signal<number | null>(null);

  /** Indicates whether the task success message is currently visible. */
  showTaskSuccessMessage = signal(false);

  /** Whether this form runs inside the add-task dialog rather than as a standalone page. */
isDialog = input(false);

/** Emits once the task is created, so the parent dialog can close itself. */
taskCreated = output<void>();

  /** Current contact search query for the assigned-to dropdown. */
  contactSearchTerm = signal('');

  /** Filters loaded contacts by the current search query. */
  filteredContacts = computed(() => {
    const searchTerm = this.contactSearchTerm().trim().toLowerCase();
    if (!searchTerm) {
      return this.contacts();
    }
    return this.contacts().filter(contact =>
      contact.contact_name.toLowerCase().includes(searchTerm)
    );
  });

  /** Assigns each contact the same deterministic avatar color as the contact list. */
  getColor = getColor;

  /** Full contact objects for the currently assigned contact ids. */
  selectedContactDetails = computed(() =>
    this.contacts().filter(contact => this.selectedContacts().includes(contact.id))
  );

  taskForm = new FormGroup({
    // Validator für maxlength hinzugefügt
    title: new FormControl('', {
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)]
    }),
    description: new FormControl(''),
    due_date: new FormControl('', {
      validators: [Validators.required]
    }),
    priority: new FormControl('medium', {
      validators: [Validators.required]
    }),
    assignedTo: new FormControl(''),
    category: new FormControl('', {
      validators: [Validators.required]
    }),
    subtaskInput: new FormControl('', {
      validators: [Validators.minLength(4), Validators.maxLength(50)]
    })
  })

  get title() {
    return this.taskForm.get('title');
  }

  get description() {
    return this.taskForm.get('description');
  }

  get duedate() {
    return this.taskForm.get('due_date');
  }

  get priority() {
    return this.taskForm.get('priority');
  }

  get assignedTo() {
    return this.taskForm.get('assignedTo');
  }

  get category() {
    return this.taskForm.get('category');
  }

  get subtaskInput() {
    return this.taskForm.get('subtaskInput');
  }

  /**
   * Submits the entire task form by creating the task, saving related contacts,
   * saving related subtasks, and resetting the form after a successful save.
   */
  async formSubmit() {
    if (!this.taskForm.valid) {
      console.log('form not valid');
      this.taskForm.markAllAsTouched();
      return;
    }

    const taskId = await this.createTask();
    if (!taskId) return;

    const contactsSaved = await this.saveTaskContacts(taskId);
    if (!contactsSaved) return;

    const subtasksSaved = await this.saveTaskSubtasks(taskId);
    if (!subtasksSaved) return;

    this.resetAndNavigate();
  }

  /** Task status pre-selected for the task being created, based on which column's "+" button opened the add-task dialog. */
  initialStatus = input<Task['status']>('todo');

  /**
   * Creates the main task record in Supabase using the current form values.
   *
   * @returns The created task id, or null if the insert failed.
   */
  private async createTask(): Promise<number | null> {
  console.log('form submitted');

  const { data, error } = await this.supabase
    .from('tasks')
    .insert([
      {
        title: this.title?.value,
        description: this.description?.value ?? '',
        due_date: this.duedate?.value,
        priority: this.priority?.value as Task['priority'],
        category: this.category?.value as Task['category'],
        status: this.initialStatus() // use the pre-selected column status instead of hardcoding 'todo'
      },
    ])
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
   * Saves the selected contacts for the created task in the task_contacts table.
   *
   * @param taskId - The id of the newly created task.
   * @returns True if the contacts were saved successfully, otherwise false.
   */
  private async saveTaskContacts(taskId: number): Promise<boolean> {
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
   * Saves all subtasks assigned to the created task.
   *
   * @param taskId - The id of the newly created task.
   * @returns True if the subtasks were saved successfully, otherwise false.
   */
  private async saveTaskSubtasks(taskId: number): Promise<boolean> {
    const insertSubtasks = this.assignedSubtasks().map(subtask => ({
      task_id: taskId,
      title: subtask,
    }));

    const { error } = await this.supabase
      .from('subtasks')
      .insert(insertSubtasks)
      .select();

    if (error) {
      console.error('Keine subtasks angekommen');
      return false;
    }

    this.assignedSubtasks.set([]);
    return true;
  }

  /**
   * Resets the form state and redirects the user after a short success delay.
   */
  private resetAndNavigate() {
  this.resetForm();
  this.showTaskSuccessMessage.set(true);
  setTimeout(() => {
    this.showTaskSuccessMessage.set(false);
    this.isDialog() ? this.taskCreated.emit() : this.router.navigate(['/board']);
  }, 1000);
}

  /**
 * Resets the task form to its default values and clears all state signals.
 */
  resetForm() {
    this.taskForm.reset({ priority: 'medium', category: '' });
    this.selectedContacts.set([]);
    this.assignedSubtasks.set([]);
    this.taskForm.markAsUntouched();
  }

  /**
 * Toggles the visibility state of the contact dropdown menu.
 */
  toggleContactDropdown() {
    this.contactDropdownOpen.update(open => !open);
  }

  /** Updates the contact search query and opens the dropdown if it is closed. */
  onAssignedToInput(event: Event) {
    this.contactSearchTerm.set((event.target as HTMLInputElement).value);
    if (!this.contactDropdownOpen()) {
      this.contactDropdownOpen.set(true);
    }
  }


  /** Closes the assigned-to dropdown when clicking outside of it. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.contactDropdownOpen()) return;
    if (!this.assignedToDropdown?.nativeElement.contains(event.target as Node)) {
      this.contactDropdownOpen.set(false);
      this.contactSearchTerm.set('');
    }
  }

  /**
   * Adds or removes a contact from the selected contacts list based on checkbox interaction.
   * 
   * @param contactId - The unique identifier of the contact to toggle.
   * @param event - The input change event triggered by the checkbox.
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
 * Adds a new subtask to the list if the input value is non-empty and not a duplicate.
 */
  addSubtask() {
    const newTask = (this.subtaskInput?.value ?? '').trim();
    if (!newTask) return;
    if (this.assignedSubtasks().includes(newTask)) {
      return;
    }
    this.assignedSubtasks.update(subtasks => [...subtasks, newTask]);
    this.resetSubtask();
  }

  /**
 * Clears the subtask input field.
 */
  resetSubtask() {
    this.subtaskInput?.reset();
  }

  /**
 * Removes a subtask from the assigned subtasks list at the specified index.
 * 
 * @param index - The zero-based index of the subtask to delete.
 */
  deleteEditSubtask(index: number) {
    this.assignedSubtasks.update(subtasks => subtasks.filter((_, i) => i !== index));
  }

  /**
 * Updates the text content of an assigned subtask at the specified index.
 * 
 * @param index - The zero-based index of the subtask to update.
 * @param newSubtask - The updated text content for the subtask.
 */
  updateEditSubtask(index: number, newSubtask: string) {
    const newText = newSubtask.trim();
    if (!newText) return;
    this.assignedSubtasks.update(subtasks => subtasks.map((task, i) => i === index ? newText : task));
  }

}
