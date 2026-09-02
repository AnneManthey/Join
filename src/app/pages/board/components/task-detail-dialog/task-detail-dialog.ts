import { AfterViewInit, Component, ElementRef, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
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
export class TaskDetailDialog implements AfterViewInit {

  getColor = getColor;

  scrollableEl = viewChild<ElementRef<HTMLDivElement>>('scrollableEl');
  trackEl = viewChild<ElementRef<HTMLDivElement>>('trackEl');

  thumbHeight = signal(0);
  thumbTop = signal(0);
  isScrollable = signal(false);

  private taskChangeEffect = effect(() => {
    this.task();
    setTimeout(() => this.checkScrollable());
  });

  ngAfterViewInit(): void {
    this.checkScrollable();
  }

  onScroll(): void {
    this.updateThumb();
  }

  scrollByStep(step: number): void {
    this.scrollableEl()?.nativeElement.scrollBy({ top: step, behavior: 'smooth' });
  }

  private checkScrollable(): void {
    const scrollable = this.scrollableEl()?.nativeElement;
    if (!scrollable) {
      return;
    }

    this.isScrollable.set(scrollable.scrollHeight > scrollable.clientHeight + 1);
    setTimeout(() => this.updateThumb());
  }

  private updateThumb(): void {
    const scrollable = this.scrollableEl()?.nativeElement;
    const track = this.trackEl()?.nativeElement;
    if (!scrollable || !track) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollable;
    const trackHeight = track.clientHeight;
    const height = Math.max((clientHeight / scrollHeight) * trackHeight, 20);
    const maxTop = trackHeight - height;
    const scrollableDistance = scrollHeight - clientHeight;
    const top = scrollableDistance > 0 ? (scrollTop / scrollableDistance) * maxTop : 0;

    this.thumbHeight.set(height);
    this.thumbTop.set(top);
  }

  priorityIcon = computed(() => {
    const currentTask = this.task();
    return currentTask ? `app-icons/board/prio-${currentTask.priority}.svg` : '';
  });

  isTaskDetailDialogOpen = input.required<boolean>();

  taskId = input.required<number>();
  task = computed(() => this.taskService.tasks().find(t => t.id === this.taskId()));
  close = output<void>();
  edit = output<Task>();

  closeDialog(): void {
    this.close.emit();
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
