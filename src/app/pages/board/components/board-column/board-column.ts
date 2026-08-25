import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardTaskCard } from '../board-task-card/board-task-card';
import { BoardColumn, Task } from '../../../../shared/interfaces/task';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [CommonModule, DragDropModule, BoardTaskCard],
  templateUrl: './board-column.html',
  styleUrl: './board-column.scss'
})
export class BoardColumnComponent {
  column = input.required<BoardColumn>();

  taskDropped = output<{ task: Task; newColumnId: string }>();
  addTaskClicked = output<void>();

  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.taskDropped.emit({
        task: event.item.data,
        newColumnId: this.column().id
      });
    }
  }
}
