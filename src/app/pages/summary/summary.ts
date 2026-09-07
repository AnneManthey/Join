import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../layout/header/header';
import { Navbar } from '../../layout/navbar/navbar';

/**
 * A single status chip shown at the top of the summary (e.g. "To-do", "Done", "Urgent").
 */
export interface StatusMetric {
  /** Unique identifier, also used for `@for` tracking */
  id: string;
  /** Text shown under the value */
  label: string;
  /** Numeric count displayed on the chip */
  value: number;
  /** Determines which icon/color variant is rendered */
  icon: 'todo' | 'done' | 'urgent';
}

/**
 * A single stat card shown at the bottom of the summary (e.g. "Tasks in Board").
 */
export interface StatMetric {
  /** Unique identifier, also used for `@for` tracking */
  id: string;
  /** Numeric value displayed on the card */
  value: number;
  /** Description shown under the value */
  label: string;
}


@Component({
  selector: 'app-summary',
  imports: [Header, Navbar, CommonModule],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary {

  /** Name of the logged-in user, used in the greeting. */
  readonly userName = signal<string>('Sofia Müller');

  /** Date of the next upcoming deadline. */
  readonly upcomingDeadline = signal<Date>(new Date('2022-10-18'));

  /** Status chips: To-do / Done / Urgent counts. */
  readonly statusMetrics = signal<StatusMetric[]>([
    { id: 'todo', label: 'To-do', value: 1, icon: 'todo' },
    { id: 'done', label: 'Done', value: 1, icon: 'done' },
    { id: 'urgent', label: 'Urgent', value: 1, icon: 'urgent' },
  ]);

  /** Stat cards: Tasks in Board / In Progress / Awaiting Feedback. */
  readonly statMetrics = signal<StatMetric[]>([
    { id: 'inBoard', value: 5, label: 'Tasks in Board' },
    { id: 'inProgress', value: 2, label: 'Tasks in Progress' },
    { id: 'awaitingFeedback', value: 2, label: 'Awaiting Feedback' },
  ]);

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
  readonly formattedDeadline = computed(() =>
    this.upcomingDeadline().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  );

}
