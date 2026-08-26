import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { BoardColumn } from './components/board-column/board-column';
import { Column, Task } from '../../shared/interfaces/task';
import { Navbar } from '../../layout/navbar/navbar';
import { Header } from '../../layout/header/header';
import { SupabaseTaskService } from '../../shared/services/supabase-task-service';

@Component({
  selector: 'app-board',
  imports: [BoardColumn, CommonModule, FormsModule, DragDropModule, Navbar, Header],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})

export class Board implements OnInit {
  private taskService = inject(SupabaseTaskService);

  /** Current task search query. */
  searchTerm = '';

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

  /** Groups the loaded tasks by their status. */
  columns = computed<Column[]>(() =>
    this.statusMap.map(s => ({
      id: s.id,
      title: s.title,
      tasks: this.taskService.tasks().filter(t => t.status === s.id),
    }))
  );

  /** Handles a task moved to another column. */
  onTaskDropped(event: { task: Task; newColumnId: string }): void {
    // später: this.taskService.updateStatus(event.task.id, event.newColumnId)
    console.log('Task moved', event);
  }

  /** Opens the add-task flow for the selected column. */
  openAddTask(columnId?: string): void {
    // später: Dialog öffnen
    console.log('open add task for column', columnId);
  }

}
