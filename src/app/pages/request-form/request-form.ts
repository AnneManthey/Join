import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PublicFooter } from '../../layout/public-footer/public-footer';

/** Time the confirmation is shown before redirecting to the welcome page. */
const REDIRECT_DELAY_MS = 2000;

/** Possible states of the request form. */
type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

/**
 * Request form for stakeholders. Validates the input and (from phase 3 on)
 * sends it to the n8n webhook, which creates the ticket.
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

  /** Validates the form and submits the request. */
  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Honeypot filled = bot. Pretend success, send nothing.
    if (this.form.controls.website.value) {
      this.markSent();
      return;
    }

    this.status.set('sending');
    const { name, email, subject, message } = this.form.getRawValue();

    // TODO phase 3: POST { name, email, subject, message } to the n8n webhook.
    // TEMPORARY: nothing is sent yet. Do not publish the page before this is done.
    console.warn('Request form: webhook not connected yet, nothing was sent.');
    void { name, email, subject, message };

    this.markSent();
  }

  /** Shows the confirmation briefly, then returns to the welcome page without intro animation. */
  private markSent(): void {
    this.status.set('sent');
    setTimeout(() => this.router.navigate(['/'], { state: { skipIntro: true } }), REDIRECT_DELAY_MS);
  }
}
