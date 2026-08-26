import { Component, input, output } from '@angular/core';
import { Task } from '../../../../shared/interfaces/task';
import { GetInitialsPipe } from '../../../../shared/pipes/get-initials-pipe';
import { getColor } from '../../../../shared/utils/contacts-helper';

@Component({
  selector: 'app-task-detail-dialog',
  imports: [GetInitialsPipe],
  templateUrl: './task-detail-dialog.html',
  styleUrl: './task-detail-dialog.scss',
})
export class TaskDetailDialog {

   getColor = getColor;

  isTaskDetailDialogOpen = input.required<boolean>();
  task = input.required<Task>();
  close = output<void>();

  closeDialog(): void {
    this.close.emit();
  }


}
