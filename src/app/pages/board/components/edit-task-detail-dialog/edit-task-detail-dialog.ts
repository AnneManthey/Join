import { Component, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task } from '../../../../shared/interfaces/task';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-edit-task-detail-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-task-detail-dialog.html',
  styleUrl: './edit-task-detail-dialog.scss',
})
export class EditTaskDetailDialog {
  isOpen = input.required<boolean>();
  task = input.required<Task>();
  close = output<void>();

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
  });

  constructor() {
    effect(() => {
      this.taskdetailForm.patchValue({
        taskdetailName: this.task().title,
        taskdetailDescription: this.task().description,
        taskdetailDuedate: this.task().due_date,
      });
      this.selectedPriority.set(this.task().priority);
    });
  }

}



