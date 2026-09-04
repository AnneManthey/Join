import { Component, ElementRef, HostListener, ViewChild, ViewChildren, QueryList, computed, inject, signal, input, output } from '@angular/core';
import { SupabaseTaskService } from '../../../../shared/services/supabase-task-service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../shared/services/supabase-service';
import { Task } from '../../../../shared/interfaces/task';
import { GetInitialsPipe } from '../../../../shared/pipes/get-initials-pipe';
import { getColor } from '../../../../shared/utils/contacts-helper';
import { futureDateValidator } from '../../../../shared/utils/future-date-validator';

@Component({
  selector: 'app-add-task-form',
  imports: [GetInitialsPipe, ReactiveFormsModule],
  templateUrl: './add-task-form.html',
  styleUrl: './add-task-form.scss',
})
/**
 * Form component for creating a new task from the board or the task dialog.
 * Handles validation, contact assignment, subtasks, and task submission.
 */
export class AddTaskForm {
  private supabaseService = inject(SupabaseService);
  supabaseTaskService = inject(SupabaseTaskService);
  private supabase = this.supabaseService.client;
  private router = inject(Router);

  @ViewChild('assignedToDropdown') assignedToDropdown?: ElementRef<HTMLElement>;
  @ViewChild('categoryDropdown') categoryDropdown?: ElementRef<HTMLElement>;
  @ViewChildren('subtaskEditWrapper') subtaskEditWrappers!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('editInput') editInputs!: QueryList<ElementRef<HTMLTextAreaElement>>;

  contacts = this.supabaseService.contacts;
  selectedContacts = this.supabaseTaskService.selectedContacts;
  assignedSubtasks = this.supabaseTaskService.assignedSubtasks;



  /** Indicates whether the category dropdown is currently opened. */
  categoryDropdownOpen = signal(false);

  /** Returns the translated label for the currently selected task category. */
  selectedCategoryLabel = computed(() => {
    const value = this.selectedCategory();
    return value === 'user_story' ? 'User Story' : value === 'technical_task' ? 'Technical Task' : '';
  });

  /** Stores the currently selected task category value. */
  private selectedCategory = signal<Task['category'] | ''>('');

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

  /** Today's date in ISO format (YYYY-MM-DD), used as the `min` value for the date input to prevent selecting past dates in the UI. */
  minDate = new Date().toISOString().split('T')[0];

  /** Current contact search query for the assigned-to dropdown. */
  contactSearchTerm = signal('');

  /** Filters the loaded contacts by the current search query. */
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

  /** Maximum number of contact avatars shown before collapsing into a "+N" badge. */
  readonly maxVisibleAvatars = 6;

  /** Subset of selected contacts rendered as avatars; excess contacts are summarized separately. */
  visibleContactDetails = computed(() =>
    this.selectedContactDetails().slice(0, this.maxVisibleAvatars)
  );

  /** Count of selected contacts not shown as individual avatars, displayed as "+N" when positive. */
  hiddenContactDetailsCount = computed(() =>
    Math.max(0, this.selectedContactDetails().length - this.maxVisibleAvatars)
  );

  /**
   * Sets the selected task category and closes the category dropdown.
   *
   * @param value The category value to assign to the task.
   */
  setCategory(value: Task['category']) {
    this.category?.setValue(value);
    this.category?.markAsTouched();
    this.selectedCategory.set(value);
    this.categoryDropdownOpen.set(false);
  }

  /** Toggles the visibility of the category dropdown and marks the field as touched when closed. */
  toggleCategoryDropdown() {
    if (this.categoryDropdownOpen()) {
      this.categoryDropdownOpen.set(false);
      this.category?.markAsTouched();
    } else {
      this.categoryDropdownOpen.set(true);
    }
  }

  /** Main form group for all task fields and validation rules. */
  taskForm = new FormGroup({
    title: new FormControl('', {
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(100)]
    }),
    description: new FormControl('', {
      validators: Validators.maxLength(150)
    }),
    due_date: new FormControl('', {
      validators: [Validators.required, futureDateValidator()]
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

  /** Returns the title form control. */
  get title() {
    return this.taskForm.get('title');
  }

  /** Returns the description form control. */
  get description() {
    return this.taskForm.get('description');
  }

  /** Returns the due date form control. */
  get duedate() {
    return this.taskForm.get('due_date');
  }

  /** Returns the priority form control. */
  get priority() {
    return this.taskForm.get('priority');
  }

  /** Returns the assigned-to form control. */
  get assignedTo() {
    return this.taskForm.get('assignedTo');
  }

  /** Returns the category form control. */
  get category() {
    return this.taskForm.get('category');
  }

  /** Returns the subtask input form control. */
  get subtaskInput() {
    return this.taskForm.get('subtaskInput');
  }

  /**
   * Submits the entire task form by creating the task, saving related contacts,
   * saving related subtasks, and resetting the form after a successful save.
   */
  async formSubmit() {
    if (!this.taskForm.valid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    const taskId = await this.supabaseTaskService.createTask({
      title: this.title?.value ?? '',
      description: this.description?.value ?? '',
      due_date: this.duedate?.value ?? '',
      priority: this.priority?.value as Task['priority'],
      category: this.category?.value as Task['category'],
      status: this.initialStatus()
    });
    if (!taskId) return;
    if (!(await this.supabaseTaskService.saveTaskContacts(taskId))) return;
    if (!(await this.supabaseTaskService.saveTaskSubtasks(taskId))) return;
    this.resetAndNavigate();
  }

  /**
   * Task status pre-selected for the task being created, based on which column's
   * "+" button opened the add-task dialog.
   */
  initialStatus = input<Task['status']>('todo');

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
   * Resets the task form to its default values and clears all local state.
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

  /** Closes the assigned-to, subtask editing state and category dropdowns when clicking outside of them. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.contactDropdownOpen() && !this.assignedToDropdown?.nativeElement.contains(event.target as Node)) {
      this.contactDropdownOpen.set(false);
      this.contactSearchTerm.set('');
    }
    if (this.categoryDropdownOpen() && !this.categoryDropdown?.nativeElement.contains(event.target as Node)) {
      this.categoryDropdownOpen.set(false);
      this.category?.markAsTouched();
    }

    const index = this.editingIndex();
    if (index !== null) {
      const wrapper = this.subtaskEditWrappers.first;
      const clickedInside = wrapper?.nativeElement.contains(event.target as Node);
      if (!clickedInside) {
        const input = this.editInputs.first;
        if (input) {
          this.supabaseTaskService.updateEditSubtask(index, input.nativeElement.value);
        }
        this.editingIndex.set(null);
      }
    }
  }

  /** Checks whether the description exceeds the configured maximum character length. */
  descriptionInputTooLong() {
    return (this.description?.value?.length ?? 0) > 150;
  }

  /** Checks whether the title exceeds the configured maximum character length. */
  titleInputTooLong() {
    return (this.title?.value?.length ?? 0) > 100;
  }

  /** Checks whether the subtask input exceeds the configured maximum character length. */
  subtaskInputTooLong() {
    return (this.subtaskInput?.value?.length ?? 0) > 50;
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
}
