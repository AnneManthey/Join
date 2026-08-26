import { Component, input, output, computed } from '@angular/core';
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

  /** Number of completed subtasks. */
  subtasksDone = computed(() => this.task().subtasks.filter(s => s.done).length);

  /** Total number of subtasks. */
  subtasksTotal = computed(() => this.task().subtasks.length);

  /** Emits the current task when the card is clicked. */
  onCardClick(): void {
    this.clicked.emit(this.task());
  }
}
