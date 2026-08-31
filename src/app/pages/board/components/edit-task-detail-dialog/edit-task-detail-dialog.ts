import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task } from '../../../../shared/interfaces/task';

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

   taskdetailForm = new FormGroup({
      taskdetailName: new FormControl('', {
      validators: [Validators.required, Validators.minLength(4)]
      }),
      taskdetailDescription: new FormControl(''),
  });

  constructor() {
    effect(() => {
      this.taskdetailForm.patchValue({
        taskdetailName: this.task().title,
        taskdetailDescription: this.task().description,
      });
    });
  }

}



