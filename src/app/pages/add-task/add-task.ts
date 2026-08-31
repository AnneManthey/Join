import { Component, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { SupabaseTaskService } from '../../shared/services/supabase-task-service';
import { Header } from '../../layout/header/header';
import { Navbar } from '../../layout/navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { AbstractControl, ValidationErrors, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../../shared/services/supabase-service';
import { Task } from '../../shared/interfaces/task';
import { GetInitialsPipe } from '../../shared/pipes/get-initials-pipe';
import { getColor } from '../../shared/utils/contacts-helper';

@Component({
  selector: 'app-add-task',
  imports: [Header, Navbar, RouterOutlet, ReactiveFormsModule, GetInitialsPipe],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask {

  // TEST!!
  taskService = inject(SupabaseTaskService);
  task = this.taskService.tasks;

  ngOnInit() {
    this.taskService.getTasks();
  }

  // TEST ENDE

  private supabaseService = inject(SupabaseService);
  private supabaseTaskService = inject(SupabaseTaskService);
  private supabase = this.supabaseService.client;

  @ViewChild('assignedToDropdown') assignedToDropdown?: ElementRef<HTMLElement>;
  contacts = this.supabaseService.contacts;
  contactDropdownOpen = signal(false);
  selectedContacts = this.supabaseTaskService.selectedContacts;
  assignedSubtasks = this.supabaseTaskService.assignedSubtasks;
  isCategoryOpen = false;
  editingIndex = signal<number | null>(null);

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
    title: new FormControl('', {
      validators: [Validators.required, Validators.minLength(4)]
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
      validators: [Validators.minLength(4)]
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

  async formSubmit() {
    if (this.taskForm.valid) {
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
            status: 'todo'
          },
        ])
        .select()

      if (error) {
        console.error('Keine Daten angekommen');
        return;
      }
      const taskId = data?.[0]?.id;

      if (!taskId) {
        console.error('Keine Task-ID vorhanden');
        return;
      }

      const insertContacts = this.selectedContacts().map(contactId => ({
        task_id: taskId,
        contact_id: contactId
      }));

      const { data: contactsData, error: contactsError } = await this.supabase
        .from('task_contacts')
        .insert(insertContacts)
        .select();

      if (contactsError) {
        console.error('Keine contact ids angekommen');
        return;
      }
      this.selectedContacts.set([]);

      const insertSubtasks = this.assignedSubtasks().map(subtask => ({
        task_id: taskId,
        title: subtask,
        // done: false
      }));

      const { data: subtaskData, error: subtaskError } = await this.supabase
        .from('subtasks')
        .insert(insertSubtasks)
        .select();

      if (subtaskError) {
        console.error('Keine subtasks angekommen');
        return;
      }
      this.assignedSubtasks.set([]);

      this.resetForm();

    } else {
      console.log('form not valid');
      this.taskForm.markAllAsTouched();
    }
  }

  resetForm() {
    this.taskForm.reset({ priority: 'medium', category: '' });
    this.selectedContacts.set([]);
    this.assignedSubtasks.set([]);
    this.taskForm.markAsUntouched();
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


  /** Closes the assigned-to dropdown when clicking outside of it. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.contactDropdownOpen()) return;
    if (!this.assignedToDropdown?.nativeElement.contains(event.target as Node)) {
      this.contactDropdownOpen.set(false);
      this.contactSearchTerm.set('');
    }
  }

  toggleSelectedContact(contactId: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedContacts.update(ids => [...ids, contactId])
    } else {
      this.selectedContacts.update(ids => ids.filter(contact => contact !== contactId));
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
