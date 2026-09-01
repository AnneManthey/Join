import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardTaskCard } from '../board-task-card/board-task-card';
import { Column, Task } from '../../../../shared/interfaces/task';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [CommonModule, DragDropModule, BoardTaskCard],
  templateUrl: './board-column.html',
  styleUrl: './board-column.scss'
})

/** Displays a board column and handles task drag-and-drop operations. */
export class BoardColumn {
  /** Column data displayed by the component. */
  column = input.required<Column>();

  /** Emits when a task is moved to another column. */
  taskDropped = output<{ task: Task; newColumnId: string }>();

  /** Emits the column id when the add-task action is selected, so the task can be pre-assigned to this column. */
  addTaskClicked = output<string>();
  taskClicked = output<Task>();



  /** Moves a task within a column or transfers it to another column. */
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

  /** Whether the viewport is narrow enough that drag&drop should yield to swipe scrolling. */
  private breakpointObserver = inject(BreakpointObserver);
  isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 560px)').pipe(map(r => r.matches)),
    { initialValue: false }
  );


}
