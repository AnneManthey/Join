import { Component, inject } from '@angular/core';
import { SupabaseTaskService } from '../../shared/services/supabase-task-service';
import { Header } from '../../layout/header/header';
import { Navbar } from '../../layout/navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { AbstractControl, ValidationErrors, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

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

  taskForm = new FormGroup({
    title : new FormControl('', {
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
    subtaskInput: new FormControl('')
  })

  formSubmit() {
    console.log('form submitted');
  }

}
