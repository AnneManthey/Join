import { Component, computed, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { BoardColumn } from './components/board-column/board-column';
import { Column, Task } from '../../shared/interfaces/task';
import { TaskDetailDialog } from './components/task-detail-dialog/task-detail-dialog';
import { EditTaskDetailDialog } from './components/edit-task-detail-dialog/edit-task-detail-dialog';
import { Navbar } from '../../layout/navbar/navbar';
import { Header } from '../../layout/header/header';
import { SupabaseTaskService } from '../../shared/services/supabase-task-service';
import { AddTaskDialog } from './components/add-task-dialog/add-task-dialog';

@Component({
  selector: 'app-board',
  imports: [BoardColumn, CommonModule, FormsModule, DragDropModule, TaskDetailDialog, Navbar, Header, AddTaskDialog, EditTaskDetailDialog],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board implements OnInit {
  /** Provides task data and persistence operations. */
  private taskService = inject(SupabaseTaskService);

  /** Current task search query. */
  searchTerm = signal('');

  /** Indicates whether the task detail dialog is open. */
  isTaskDetailDialogOpen = signal(false);

  /** Task currently displayed in the detail dialog. */
  selectedTask = signal<Task | null>(null);

  /** Indicates whether the edit-task dialog is open. */
  isEditTaskDetailDialogOpen = signal(false);
  @ViewChild('addTaskDialog') addTaskDialog!: ElementRef<HTMLDialogElement>;


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

  /** Status pre-selected for a new task, based on which column's "+" button was clicked. */
  initialStatus = signal<Task['status']>('todo');

  /**
  * Opens the add-task dialog, pre-filling the task status with the column
  * that triggered the add-task flow.
  *
  * @param columnId - The column that initiated the add-task flow, if applicable.
  */
  openAddTask(columnId?: string): void {
    this.initialStatus.set((columnId as Task['status']) ?? 'todo');
    this.openAddTaskDialog();
  }

  /** Opens the detail dialog for the selected task. */
  openTaskDetail(task: Task): void {
    this.selectedTask.set(task);
    this.isTaskDetailDialogOpen.set(true);
  }

  /** Closes the task detail dialog. */
  closeTaskDetail(): void {
    this.isTaskDetailDialogOpen.set(false);
  }

  /** Opens the edit dialog for the selected task. */
  openEditTaskDetail(task: Task): void {
    this.selectedTask.set(task);
    this.isTaskDetailDialogOpen.set(false);
    this.isEditTaskDetailDialogOpen.set(true);
  }

  /** Closes the edit-task dialog. */
  closeEditTaskDetail(): void {
    this.isEditTaskDetailDialogOpen.set(false);
  }
  /**
   * Opens the add-task dialog unless it is already open.
   */
  openAddTaskDialog(): void {
    const dialog = this.addTaskDialog.nativeElement;
    if (!dialog.open) {
      dialog.showModal();
    }
  }

/**
 * Closes the add-task dialog, playing the exit animation first.
 */
closeAddTaskDialog(): void {
  const dialog = this.addTaskDialog.nativeElement;

  if (!dialog.open) {
    return;
  }

  dialog.classList.add('add-task-dialog--closing');

  const onAnimationEnd = () => {
    dialog.classList.remove('add-task-dialog--closing');
    dialog.close();
    dialog.removeEventListener('animationend', onAnimationEnd);
  };

  dialog.addEventListener('animationend', onAnimationEnd);
}

  /**
   * Closes the add-task dialog when the user clicks its backdrop.
   *
   * @param event - The click event emitted by the dialog element.
   */
  closeAddTaskDialogOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeAddTaskDialog();
    }
  }

}
