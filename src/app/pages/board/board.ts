import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { BoardColumnComponent } from './components/board-column/board-column';
import { BoardColumn, Task } from '../../shared/interfaces/task';
import { Navbar } from '../../layout/navbar/navbar';
import { Header } from '../../layout/header/header';

@Component({
  selector: 'app-board',
  imports: [BoardColumnComponent, CommonModule, FormsModule, DragDropModule, Navbar, Header],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  searchTerm = signal('');

  // Platzhalter bis Supabase-Service steht
  columns = signal<BoardColumn[]>([
    { id: 'todo', title: 'To do', tasks: [] },
    { id: 'in-progress', title: 'In progress', tasks: [] },
    { id: 'await-feedback', title: 'Await feedback', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] },
  ]);

  onTaskDropped(event: { task: Task; newColumnId: string }): void {
    // später: Persistenz über Service anstoßen
    console.log('Task moved', event);
  }

  openAddTask(columnId?: string): void {
    // später: Dialog öffnen
  }
}
