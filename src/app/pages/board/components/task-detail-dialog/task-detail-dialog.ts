import { Component, input, output } from '@angular/core';
import { Task } from '../../../../shared/interfaces/task';

@Component({
  selector: 'app-task-detail-dialog',
  imports: [],
  templateUrl: './task-detail-dialog.html',
  styleUrl: './task-detail-dialog.scss',
})
export class TaskDetailDialog {

  isTaskDetailDialogOpen = input.required<boolean>();
  task = input.required<Task>();
  close = output<void>();

  closeDialog(): void {
    this.close.emit();
  }


}
