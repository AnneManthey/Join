import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { BoardColumn } from './components/board-column/board-column';
import { Column, Task } from '../../shared/interfaces/task';
import { TaskDetailDialog } from './components/task-detail-dialog/task-detail-dialog';
import { Navbar } from '../../layout/navbar/navbar';
import { Header } from '../../layout/header/header';
import { SupabaseTaskService } from '../../shared/services/supabase-task-service';

@Component({
  selector: 'app-board',
  imports: [BoardColumn, CommonModule, FormsModule, DragDropModule, TaskDetailDialog, Navbar, Header],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board implements OnInit {
  private taskService = inject(SupabaseTaskService);

  /** Current task search query. */
  searchTerm = signal('');
  isTaskDetailDialogOpen = signal(false);
  selectedTask = signal<Task | null>(null);

  /** Loads the tasks required to render the board. */
  ngOnInit(): void {
    this.taskService.getTasks();
  }

  /** Maps task statuses to their corresponding board columns. */
  private statusMap: { id: Task['status']; title: string }[] = [
    { id: 'todo', title: 'To do' },
    { id: 'in_progress', title: 'In progress' },
    { id: 'await_feedback', title: 'Await feedback' },
    { id: 'done', title: 'Done' },
  ];

  /** Filters loaded tasks by the current search query. */
  filteredTasks = computed(() => {
    const searchTerm = this.searchTerm().trim().toLowerCase();

    if (!searchTerm) {
      return this.taskService.tasks();
    }

    return this.taskService.tasks().filter(task =>
      task.title.toLowerCase().includes(searchTerm) ||
      task.description?.toLowerCase().includes(searchTerm)
    );
  });

  /** Indicates whether a non-empty search has no matching tasks. */
  noTasksFound = computed(() =>
    this.searchTerm().trim().length > 0 && this.filteredTasks().length === 0
  );

  /** Groups filtered tasks by their status. */
  columns = computed<Column[]>(() =>
    this.statusMap.map(s => ({
      id: s.id,
      title: s.title,
      tasks: this.filteredTasks().filter(t => t.status === s.id),
    }))
  );

  /** Handles a task moved to another column. */
  async onTaskDropped(event: { task: Task; newColumnId: string }): Promise<void> {
    const updated = await this.taskService.setStatus(
      event.newColumnId as Task['status'],
      event.task.id
    );

    if (updated) {
      await this.taskService.getTasks();
    }
  }

  /** Opens the add-task flow for the selected column. */
  openAddTask(columnId?: string): void {
    // später: Dialog öffnen
    console.log('open add task for column', columnId);
  }

  openTaskDetail(task: Task): void {
    this.selectedTask.set(task);
    this.isTaskDetailDialogOpen.set(true);
  }

  closeTaskDetail(): void {
    this.isTaskDetailDialogOpen.set(false);
  }
}
