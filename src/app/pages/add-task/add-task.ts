import { Component, inject } from '@angular/core';
import { SupabaseTaskService } from '../../shared/services/supabase-task-service';
import { Header } from '../../layout/header/header';
import { Navbar } from '../../layout/navbar/navbar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-add-task',
  imports: [Header, Navbar, RouterOutlet],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask {

  // TEST!!
  taskService = inject(SupabaseTaskService);
  task = this.taskService.tasks;

  ngOnInit() {
    this.taskService.getTasks();
  }

}
