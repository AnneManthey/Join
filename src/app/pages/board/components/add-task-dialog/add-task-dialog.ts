import { Component } from '@angular/core';
import { AddTaskForm } from '../add-task-form/add-task-form';

@Component({
  selector: 'app-add-task-dialog',
  imports: [AddTaskForm],
  templateUrl: './add-task-dialog.html',
  styleUrl: './add-task-dialog.scss',
})
export class AddTaskDialog {}
