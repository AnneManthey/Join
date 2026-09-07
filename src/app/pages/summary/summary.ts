import { Component, computed, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { Header } from '../../layout/header/header';
import { Navbar } from '../../layout/navbar/navbar';
import { RouterLink } from '@angular/router';
import { Task } from '../../shared/interfaces/task';
import { StatMetric, StatusMetric } from '../../shared/interfaces/summary-metric';
import { SupabaseTaskService } from '../../shared/services/supabase-task-service';


@Component({
  selector: 'app-summary',
  imports: [Header, Navbar, RouterLink],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary {
  private readonly taskService = inject(SupabaseTaskService);

  /** Name of the logged-in user, used in the greeting. */
  readonly userName = signal<string>('Sofia Müller');

  /** All tasks currently loaded from Supabase. */
  readonly tasks = computed(() => this.taskService.tasks());

  /** Status chips: To-do / Done / Urgent counts. */
  readonly statusMetrics = computed<StatusMetric[]>(() => [
    { id: 'todo', label: 'To-do', value: this.countByStatus('todo'), icon: 'todo' },
    { id: 'done', label: 'Done', value: this.countByStatus('done'), icon: 'done' },
    { id: 'urgent', label: 'Urgent', value: this.deadlineTaskCount(), icon: 'urgent' },
  ]);

  /** Stat cards: Tasks in Board / In Progress / Awaiting Feedback. */
  readonly statMetrics = computed<StatMetric[]>(() => [
    { id: 'inBoard', value: this.tasks().length, label: 'Tasks in Board' },
    { id: 'inProgress', value: this.countByStatus('in_progress'), label: 'Tasks in Progress' },
    { id: 'awaitingFeedback', value: this.countByStatus('await_feedback'), label: 'Awaiting Feedback' },
  ]);

  /** The next deadline among open tasks, including the closest overdue deadline. */
  readonly upcomingDeadline = computed(() => {
    const openTasks = this.tasks().filter(task => task.status !== 'done' && task.due_date);
    const today = this.toDateKey(new Date());
    const upcoming = openTasks.filter(task => task.due_date >= today).sort(this.compareDueDates);
    if (upcoming.length > 0) return upcoming[0].due_date;

    return openTasks.sort((first, second) => this.compareDueDates(second, first))[0]?.due_date ?? null;
  });

  /** Number of open tasks due on the displayed deadline. */
  readonly deadlineTaskCount = computed(() => {
    const deadline = this.upcomingDeadline();
    return deadline ? this.tasks().filter(task => task.status !== 'done' && task.due_date === deadline).length : 0;
  });

  /**
   * Time-of-day greeting.
   * @returns "Good morning", "Good afternoon" or "Good evening" based on the current hour.
   */
  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  /**
   * Human-readable deadline date.
   * @returns `upcomingDeadline` formatted as e.g. "October 18, 2022".
   */
  readonly formattedDeadline = computed(() => {
    const deadline = this.upcomingDeadline();
    return deadline
      ? new Date(`${deadline}T00:00:00`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      : '-';
  });

  private countByStatus(status: Task['status']): number {
    return this.tasks().filter(task => task.status === status).length;
  }

  private compareDueDates(first: Task, second: Task): number {
    return first.due_date.localeCompare(second.due_date);
  }

  private toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

}
