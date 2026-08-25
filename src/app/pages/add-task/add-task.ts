import { Component, inject } from '@angular/core';
import { SupabaseTaskService } from '../../shared/services/supabase-task-service';

@Component({
  selector: 'app-add-task',
  imports: [],
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
