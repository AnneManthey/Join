import { Component, HostListener, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../../shared/interfaces/task';
import { GetInitialsPipe } from '../../../../shared/pipes/get-initials-pipe';
import { getColor } from '../../../../shared/utils/contacts-helper';


@Component({
  selector: 'app-board-task-card',
  standalone: true,
  imports: [CommonModule, GetInitialsPipe],
  templateUrl: './board-task-card.html',
  styleUrl: './board-task-card.scss',
})

/** Displays a task summary as an interactive board card. */
export class BoardTaskCard {
  /** Task displayed by the card. */
  task = input.required<Task>();

  /** Assigns each contact the same deterministic avatar color as the contact list. */
  getColor = getColor;

  /** Emits when the task card is selected. */
  clicked = output<Task>();

  /** Emits the selected target status when the task is moved from the mobile menu. */
  taskMoved = output<Task['status']>();

  /** Indicates whether the mobile task movement menu is visible. */
  isMoveMenuOpen = signal(false);

  /** Available target columns, excluding the task's current column. */
  moveOptions = computed(() => [
    { id: 'todo' as const, title: 'To do' },
    { id: 'in_progress' as const, title: 'In progress' },
    { id: 'await_feedback' as const, title: 'Await feedback' },
    { id: 'done' as const, title: 'Done' },
  ].filter(option => option.id !== this.task().status));

  /** Number of completed subtasks. */
  subtasksDone = computed(() => this.task().subtasks.filter(s => s.done).length);

  /** Total number of subtasks. */
  subtasksTotal = computed(() => this.task().subtasks.length);

  /** Path to the icon matching the task priority. */
  priorityIcon = computed(() => `app-icons/board/prio-${this.task().priority}.svg`);

  /** Emits the current task when the card is clicked. */
  onCardClick(): void {
    this.clicked.emit(this.task());
  }

  /** Toggles the mobile task movement menu without selecting the card. */
  toggleMoveMenu(event: Event): void {
    event.stopPropagation();
    this.isMoveMenuOpen.update(isOpen => !isOpen);
  }

  /** Closes the menu and emits the selected target status. */
  moveTask(status: Task['status'], event: Event): void {
    event.stopPropagation();
    this.isMoveMenuOpen.set(false);
    this.taskMoved.emit(status);
  }

  /** Closes the mobile task movement menu after a click outside the card. */
  @HostListener('document:click')
  closeMoveMenu(): void {
    this.isMoveMenuOpen.set(false);
  }
}
