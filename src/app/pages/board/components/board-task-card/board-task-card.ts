import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../../shared/interfaces/task';

@Component({
  selector: 'app-board-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-task-card.html',
  styleUrl: './board-task-card.scss',
})
export class BoardTaskCard {
  task = input.required<Task>();

  clicked = output<Task>();

  onCardClick(): void {
    this.clicked.emit(this.task());
  }
}
