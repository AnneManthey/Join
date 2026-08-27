import { Component, computed, inject, input, output } from '@angular/core';
import { Subtask, Task } from '../../../../shared/interfaces/task';
import { GetInitialsPipe } from '../../../../shared/pipes/get-initials-pipe';
import { getColor } from '../../../../shared/utils/contacts-helper';
import { TitleCasePipe } from '@angular/common';
import { DatePipe } from '@angular/common';
import { SupabaseTaskService } from '../../../../shared/services/supabase-task-service';


@Component({
  selector: 'app-task-detail-dialog',
  imports: [GetInitialsPipe, TitleCasePipe, DatePipe],
  templateUrl: './task-detail-dialog.html',
  styleUrl: './task-detail-dialog.scss',
})
export class TaskDetailDialog {

   getColor = getColor;

   priorityIcon = computed(() => `app-icons/board/prio-${this.task().priority}.svg`);

  isTaskDetailDialogOpen = input.required<boolean>();
  task = input.required<Task>();
  close = output<void>();
  edit = output<Task>();

  closeDialog(): void {
    this.close.emit();
  }

  private taskService = inject(SupabaseTaskService);

  toggleSubtask(subtask: Subtask): void {
    const neuerStatus = !subtask.done;
   this.taskService.toggleSubtask(subtask.id, neuerStatus);
  }

    deleteTask(): void {
      // Placeholder
  }

  editTask(): void {
    // Placeholder
  }



}
