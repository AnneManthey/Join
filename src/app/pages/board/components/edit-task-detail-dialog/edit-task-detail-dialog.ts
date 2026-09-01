import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task } from '../../../../shared/interfaces/task';
import { SupabaseService } from '../../../../shared/services/supabase-service';
import { SupabaseTaskService } from '../../../../shared/services/supabase-task-service';
import { GetInitialsPipe } from '../../../../shared/pipes/get-initials-pipe';
import { getColor } from '../../../../shared/utils/contacts-helper';

@Component({
  selector: 'app-edit-task-detail-dialog',
  imports: [ReactiveFormsModule, GetInitialsPipe],
  templateUrl: './edit-task-detail-dialog.html',
  styleUrl: './edit-task-detail-dialog.scss',
})
export class EditTaskDetailDialog {
  isOpen = input.required<boolean>();
  task = input.required<Task>();
  close = output<void>();

  private supabaseService = inject(SupabaseService);
  private supabaseTaskService = inject(SupabaseTaskService);

  contacts = this.supabaseService.contacts;
  selectedContacts = this.supabaseTaskService.selectedContacts;
  assignedSubtasks = this.supabaseTaskService.assignedSubtasks;
  getColor = getColor;

  /** Index of the subtask currently being edited, if any. */
  editingIndex = signal<number | null>(null);

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
    this.contacts().filter(contact => this.selectedContacts().includes(contact.id))
  );

  closeDialog(): void {
    this.close.emit();
  }

  selectedPriority = signal<Task['priority']>('medium');

  setPriority(priority: Task['priority']): void {
    this.selectedPriority.set(priority);
  }

   taskdetailForm = new FormGroup({
      taskdetailName: new FormControl('', {
      validators: [Validators.required, Validators.minLength(4)]
      }),
      taskdetailDescription: new FormControl(''),
      taskdetailDuedate: new FormControl(''),
      assignedTo: new FormControl(''),
      subtaskInput: new FormControl('', {
        validators: [Validators.minLength(4)]
      }),
  });

  get assignedTo() {
    return this.taskdetailForm.get('assignedTo');
  }

  get subtaskInput() {
    return this.taskdetailForm.get('subtaskInput');
  }

  constructor() {
    effect(() => {
      this.taskdetailForm.patchValue({
        taskdetailName: this.task().title,
        taskdetailDescription: this.task().description,
        taskdetailDuedate: this.task().due_date,
      });
      this.selectedPriority.set(this.task().priority);
      this.supabaseTaskService.currentTaskId = this.task().id;
      this.selectedContacts.set(this.task().task_contacts.map(taskContact => taskContact.contacts.id));
      this.assignedSubtasks.set(this.task().subtasks.map(subtask => subtask.title));
    });
  }

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

  /** Closes the assigned-to dropdown, e.g. via a "Done" button. */
  closeContactDropdown() {
    this.contactDropdownOpen.set(false);
    this.contactSearchTerm.set('');
  }

  toggleSelectedContact(contactId: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedContacts.update(ids => [...ids, contactId]);
    } else {
      this.selectedContacts.update(ids => ids.filter(id => id !== contactId));
    }
  }

  addSubtask() {
    const newTask = (this.subtaskInput?.value ?? '').trim();
    if (!newTask) return;
    if (this.assignedSubtasks().includes(newTask)) {
      return;
    }
    this.assignedSubtasks.update(subtasks => [...subtasks, newTask]);
    this.resetSubtask();
  }

  resetSubtask() {
    this.subtaskInput?.reset();
  }

  deleteEditSubtask(index: number) {
    this.assignedSubtasks.update(subtasks => subtasks.filter((_, i) => i !== index));
  }

  updateEditSubtask(index: number, newSubtask: string) {
    const newText = newSubtask.trim();
    if (!newText) return;
    this.assignedSubtasks.update(subtasks => subtasks.map((task, i) => i === index ? newText : task));

  }

}



