import { Component, input, output, ViewChild } from '@angular/core';
import { AddTaskForm } from '../add-task-form/add-task-form';
import { Task } from '../../../../shared/interfaces/task';

@Component({
  selector: 'app-add-task-dialog',
  imports: [AddTaskForm],
  templateUrl: './add-task-dialog.html',
  styleUrl: './add-task-dialog.scss',
})
export class AddTaskDialog {

  @ViewChild(AddTaskForm) private addTaskForm!: AddTaskForm;

  /** Task status pre-selected for the task being created, based on which column's "+" button opened this dialog. */
  initialStatus = input<Task['status']>('todo');

  /** Bubbles up the form's taskCreated event so the parent (Board) can close the dialog. */
  taskCreated = output<void>();

  /** Resets the embedded add-task form. */
  resetForm(): void {
    this.addTaskForm.resetForm();
  }
}
