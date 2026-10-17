import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { PublicFooter } from '../../layout/public-footer/public-footer';

/** Time the confirmation is shown before redirecting to the welcome page. */
const REDIRECT_DELAY_MS = 2000;

/** Maximum time to wait for the n8n workflow (AI call and mail dispatch take a few seconds). */
const REQUEST_TIMEOUT_MS = 15000;

/** HTTP status the webhook returns when the daily request limit is reached. */
const STATUS_LIMIT_REACHED = 429;

/** Possible states of the request form. */
type FormStatus = 'idle' | 'sending' | 'sent' | 'limit' | 'error';

/**
 * Request form for stakeholders. Validates the input and sends it to the
 * n8n webhook, which creates the ticket.
 */
@Component({
  selector: 'app-request-form',
  imports: [ReactiveFormsModule, RouterLink, PublicFooter],
  templateUrl: './request-form.html',
  styleUrl: './request-form.scss',
})
export class RequestForm {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  /** Form fields. `website` is a honeypot that real users never see or fill. */
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    subject: ['', [Validators.required, Validators.maxLength(150)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    website: [''],
  });

  /** Current state of the form (drives which part of the page is shown). */
  readonly status = signal<FormStatus>('idle');

  /**
   * Whether a field should show its error message.
   * @param field name of the form control
   */
  showError(field: 'name' | 'email' | 'subject' | 'message'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  /**
 * Validates the form and submits the request.
 */
  public async submit(): Promise<void> {
    if (this.isFormInvalid()) return;
    if (this.isBotDetected()) return;
    await this.sendRequest();
  }

  /**
   * Checks if the form is invalid and marks all fields as touched.
   */
  private isFormInvalid(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return true;
    }
    return false;
  }

  /**
   * Checks for spam bots via the honeypot field.
   */
  private isBotDetected(): boolean {
    if (this.form.controls.website.value) {
      this.markSent();
      return true;
    }
    return false;
  }

  /**
   * Handles the sending state, request execution, and error handling.
   */
  private async sendRequest(): Promise<void> {
    this.status.set('sending');
    try {
      const response = await this.executePost();
      this.handleResponse(response.status);
    } catch {
      this.status.set('error');
    }
  }

  /**
   * Performs the actual HTTP fetch request.
   */
  private async executePost(): Promise<Response> {
    const { name, email, subject, message } = this.form.getRawValue();
    return fetch(environment.requestWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message, website: '' }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  }

  /**
   * Maps the HTTP status of the webhook response to a form state.
   * @param httpStatus status code returned by the n8n webhook
   */
  private handleResponse(httpStatus: number): void {
    if (httpStatus === STATUS_LIMIT_REACHED) {
      this.status.set('limit');
    } else if (httpStatus >= 200 && httpStatus < 300) {
      this.markSent();
    } else {
      this.status.set('error');
    }
  }

  /** Shows the confirmation briefly, then returns to the welcome page without intro animation. */
  private markSent(): void {
    this.status.set('sent');
    setTimeout(() => this.router.navigate(['/'], { state: { skipIntro: true } }), REDIRECT_DELAY_MS);
  }
}