import { Component, ElementRef, HostListener, QueryList, ViewChildren, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task } from '../../../../shared/interfaces/task';
import { SupabaseService } from '../../../../shared/services/supabase-service';
import { SupabaseTaskService } from '../../../../shared/services/supabase-task-service';
import { GetInitialsPipe } from '../../../../shared/pipes/get-initials-pipe';
import { getColor } from '../../../../shared/utils/contacts-helper';

/**
 * Dialog component for editing task details.
 * Manages editing of task information, contacts, and subtasks.
 */
@Component({
  selector: 'app-edit-task-detail-dialog',
  imports: [ReactiveFormsModule, GetInitialsPipe],
  templateUrl: './edit-task-detail-dialog.html',
  styleUrl: './edit-task-detail-dialog.scss',
})
export class EditTaskDetailDialog {
  /** Controls whether the dialog is open or closed. */
  isOpen = input.required<boolean>();

  /** The ID of the task being edited. */
  taskId = input.required<number>();

  /** The current task based on the taskId. */
  task = computed(() => this.supabaseTaskService.tasks().find(t => t.id === this.taskId()));

  /** Emits when the dialog should be closed. */
  close = output<void>();

  private supabaseService = inject(SupabaseService);
  private supabaseTaskService = inject(SupabaseTaskService);

  /** All available contacts. */
  contacts = this.supabaseService.contacts;

  /** IDs of currently selected contacts (local to this dialog, not shared with add-task). */
  editSelectedContacts = signal<number[]>([]);

  /** Titles of subtasks being edited in this dialog (local, not global). */
  editSubtasks = signal<string[]>([]);

  /** Function for color mapping of contacts. */
  getColor = getColor;

  /** References to the currently rendered subtask-edit wrappers, used to detect outside clicks. */
  @ViewChildren('subtaskEditWrapper') subtaskEditWrappers!: QueryList<ElementRef<HTMLElement>>;

  /** References to the currently rendered subtask-edit inputs, used to save on outside clicks. */
  @ViewChildren('editInput') editInputs!: QueryList<ElementRef<HTMLTextAreaElement>>;

  /** Index of the subtask currently being edited, if any. */
  editingIndex = signal<number | null>(null);

  hoveredSubtaskIndex = signal<number | null>(null);

  /** Whether the assigned-to contact dropdown is currently open. */
  contactDropdownOpen = signal(false);

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

  /** Full contact objects for the currently assigned contact ids. */
  selectedContactDetails = computed(() =>
    this.contacts().filter(contact => this.editSelectedContacts().includes(contact.id))
  );

  /** Whether the dialog is currently playing its closing animation. */
  isClosing = signal(false);

  /**
   * Plays the closing animation, then emits a close event.
   */
  closeDialog(): void {
    this.isClosing.set(true);
    setTimeout(() => {
      this.isClosing.set(false);
      this.close.emit();
    }, 300);
  }

  /** The currently selected priority of the task. */
  selectedPriority = signal<Task['priority']>('medium');

  /**
   * Sets the priority of the task.
   * @param priority - The new priority level (low, medium, high).
   */
  setPriority(priority: Task['priority']): void {
    this.selectedPriority.set(priority);
  }

  /** Reactive form for task details. */
  taskdetailForm = new FormGroup({
    taskdetailName: new FormControl('', {
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(100)]
    }),
    taskdetailDescription: new FormControl('', {
      validators: Validators.maxLength(150)
    }),
    taskdetailDuedate: new FormControl(''),
    assignedTo: new FormControl(''),
    subtaskInput: new FormControl('', {
      validators: [Validators.minLength(4), Validators.maxLength(50)]
    }),
  });

  /**
   * Returns the FormControl for the 'taskdetailName' field.
   */
  get taskdetailName() {
    return this.taskdetailForm.get('taskdetailName');
  }

  /** Checks whether the title exceeds the configured maximum character length. */
  titleInputTooLong() {
    return (this.taskdetailName?.value?.length ?? 0) > 100;
  }

  /**
   * Returns the FormControl for the 'taskdetailDescription' field.
   */
  get taskdetailDescription() {
    return this.taskdetailForm.get('taskdetailDescription');
  }

  /** Checks whether the description exceeds the configured maximum character length. */
  descriptionInputTooLong() {
    return (this.taskdetailDescription?.value?.length ?? 0) > 150;
  }

  /**
   * Returns the FormControl for the 'assignedTo' field.
   */
  get assignedTo() {
    return this.taskdetailForm.get('assignedTo');
  }

  /**
   * Returns the FormControl for the 'subtaskInput' field.
   */
  get subtaskInput() {
    return this.taskdetailForm.get('subtaskInput');
  }

  /**
   * Initializes the component and watches the current task
   * to update the form with its values.
   */
  constructor() {
    effect(() => {
      const currentTask = this.task();
      if (!currentTask) return;

      this.taskdetailForm.patchValue({
        taskdetailName: currentTask.title,
        taskdetailDescription: currentTask.description,
        taskdetailDuedate: currentTask.due_date,
      });
      this.selectedPriority.set(currentTask.priority);
      this.supabaseTaskService.currentTaskId = currentTask.id;
      this.editSelectedContacts.set(currentTask.task_contacts.map(taskContact => taskContact.contacts.id));
      this.editSubtasks.set(currentTask.subtasks.map(subtask => subtask.title));
    });
  }

  /**
   * Toggles the visibility of the contact dropdown.
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

  /**
   * Closes the contact dropdown and clears the search term.
   */
  closeContactDropdown() {
    this.contactDropdownOpen.set(false);
    this.contactSearchTerm.set('');
  }

  /**
   * Adds or removes a contact from the selection.
   * @param contactId - The ID of the contact.
   * @param event - The click event from the checkbox element.
   */
  toggleSelectedContact(contactId: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.editSelectedContacts.update(ids => [...ids, contactId]);
    } else {
      this.editSelectedContacts.update(ids => ids.filter(id => id !== contactId));
    }
  }

  /**
   * Adds a new subtask to the list if it is not empty and not a duplicate.
   */
  addSubtask() {
    const newTask = (this.subtaskInput?.value ?? '').trim();
    if (!newTask) return;
    if (this.editSubtasks().includes(newTask)) {
      return;
    }
    this.editSubtasks.update(subtasks => [...subtasks, newTask]);
    this.resetSubtask();
    this.hoveredSubtaskIndex.set(null);
  }

  /**
   * Resets the subtask input field.
   */
  resetSubtask() {
    this.subtaskInput?.reset();
  }

  /** Checks whether the subtask input exceeds the configured maximum character length. */
  subtaskInputTooLong() {
    return (this.subtaskInput?.value?.length ?? 0) > 50;
  }

  /** Saves an in-progress subtask edit when the user clicks outside of it. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const index = this.editingIndex();
    if (index === null) return;

    const wrapper = this.subtaskEditWrappers.first;
    const clickedInside = wrapper?.nativeElement.contains(event.target as Node);
    if (!clickedInside) {
      const input = this.editInputs.first;
      if (input) {
        this.updateEditSubtask(index, input.nativeElement.value);
      }
      this.editingIndex.set(null);
    }
  }

  /**
   * Deletes a subtask from the list based on its index.
   * @param index - The index of the subtask to delete.
   */
  deleteEditSubtask(index: number) {
    this.editSubtasks.update(subtasks => subtasks.filter((_, i) => i !== index));
    this.hoveredSubtaskIndex.set(null);
  }

  /**
   * Updates the text of a subtask based on its index.
   * @param index - The index of the subtask to update.
   * @param newSubtask - The new text of the subtask.
   */
  updateEditSubtask(index: number, newSubtask: string) {
    const newText = newSubtask.trim();
    if (!newText) return;
    this.editSubtasks.update(subtasks => subtasks.map((task, i) => i === index ? newText : task));
  }

  async onEditSubmit() {
    const currentTask = this.task();
    if (!currentTask) return;

    const updatedFields: Partial<Task> = {
      title: this.taskdetailForm.value.taskdetailName ?? '',
      description: this.taskdetailForm.value.taskdetailDescription ?? '',
      due_date: this.taskdetailForm.value.taskdetailDuedate ?? '',
      priority: this.selectedPriority() as Task['priority'],
    };

    const taskSuccess = await this.supabaseTaskService.editTask(currentTask.id, updatedFields);
    if (!taskSuccess) return;

    const contactsSuccess = await this.supabaseTaskService.updateAssignedContacts(currentTask.id, this.editSelectedContacts());
    if (!contactsSuccess) return;

    const subtasksSuccess = await this.supabaseTaskService.addNewSubtasks(currentTask.id, this.editSubtasks());
    if (!subtasksSuccess) return;

    this.editSelectedContacts.set([]);
    this.editSubtasks.set([]);
    console.log('Task successfully updated');
    this.close.emit();
  }

}



