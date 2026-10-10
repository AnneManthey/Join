import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicFooter } from '../../layout/public-footer/public-footer';
import { SupabaseService } from '../../shared/services/supabase-service';

/** Maximum number of AI-processed requests per day (same value as p_limit in n8n). */
const DAILY_REQUEST_LIMIT = 10;

/**
 * Stakeholder landing page: explains the request process
 * and shows how many requests were used today.
 */

@Component({
  selector: 'app-stakeholder',
  imports: [RouterLink, PublicFooter],
  templateUrl: './stakeholder.html',
  styleUrl: './stakeholder.scss',
})

export class Stakeholder implements OnInit {
  private readonly supabase = inject(SupabaseService).client;

  /** Daily request limit shown in the texts. */
  readonly dailyLimit = DAILY_REQUEST_LIMIT;

  /** Requests used today (null until loaded or if loading failed). */
  readonly used = signal<number | null>(null);

  /** Whether today's limit has been reached. */
  readonly limitReached = computed(() => (this.used() ?? 0) >= DAILY_REQUEST_LIMIT);

  /** Loads today's usage when the page opens. */
  async ngOnInit(): Promise<void> {
    const { data, error } = await this.supabase.rpc('get_email_usage_today');
    if (error) {
      console.error('Could not load request usage', error.message);
      return;
    }
    this.used.set(Number(data));
  }
}
