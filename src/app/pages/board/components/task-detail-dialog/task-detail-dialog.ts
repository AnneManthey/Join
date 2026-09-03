import { Component, computed, inject, input, output, signal } from '@angular/core';
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

  priorityIcon = computed(() => {
    const currentTask = this.task();
    return currentTask ? `app-icons/board/prio-${currentTask.priority}.svg` : '';
  });

  isTaskDetailDialogOpen = input.required<boolean>();

  taskId = input.required<number>();
  task = computed(() => this.taskService.tasks().find(t => t.id === this.taskId()));
  close = output<void>();
  edit = output<Task>();

  isClosing = signal(false);

  closeDialog(): void {
    this.isClosing.set(true);
    setTimeout(() => {
      this.isClosing.set(false);
      this.close.emit();
    }, 300);
  }

  taskService = inject(SupabaseTaskService);

  toggleSubtask(subtask: Subtask): void {
    const neuerStatus = !subtask.done;
    this.taskService.toggleSubtask(subtask.id, neuerStatus);
  }

  deleteTask(): void {
    // Placeholder
  }

  editTask(): void {
    const currentTask = this.task();
    if (currentTask) {
      this.edit.emit(currentTask);
    }
  }
}
