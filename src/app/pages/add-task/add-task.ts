import { Component, inject, signal } from '@angular/core';
import { SupabaseTaskService } from '../../shared/services/supabase-task-service';
import { Header } from '../../layout/header/header';
import { Navbar } from '../../layout/navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { AbstractControl, ValidationErrors, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../../shared/services/supabase-service';

@Component({
  selector: 'app-add-task',
  imports: [Header, Navbar, RouterOutlet, ReactiveFormsModule],
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
  private supabase = this.supabaseService.client;
  contacts = this.supabaseService.contacts;
  contactDropdownOpen = signal(false);
  selectedContacts = signal<number[]>([]);
  assignedSubtasks = signal<string[]>([]);



  taskForm = new FormGroup({
    title: new FormControl('', {
      validators: [Validators.required, Validators.minLength(4)]
    }),
    description: new FormControl(''),
    due_date: new FormControl('', {
      validators: [Validators.required]
    }),
    priority: new FormControl('', {
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
            priority: this.priority?.value,
            category: this.category?.value,
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

    } else {
      console.log('form not valid');
    }
  }

  toggleContactDropdown() {
    this.contactDropdownOpen.update(open => !open);
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
}
