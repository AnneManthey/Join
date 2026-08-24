import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contact } from '../../../../shared/interfaces/contact';
import { SupabaseService } from '../../../../shared/services/supabase-service';

@Component({
  selector: 'app-add-contact-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './add-contact-dialog.html',
  styleUrl: './add-contact-dialog.scss',
})
export class AddContactDialog {
  @Output() closeRequested = new EventEmitter<void>();
  @Output() contactCreated = new EventEmitter<Contact>();

  private fb = inject(FormBuilder);
  private readonly dataService = inject(SupabaseService);

  /** Indicates whether a contact creation request is in progress. */
  isSubmitting = false;

  /** Stores the latest contact creation error for display in the form. */
  errorMessage: string | null = null;

  /** Controls whether the dialog is rendered. */
  isDialogOpen = true;

  /** Allows letters (incl. umlauts) and spaces only. */
  private readonly namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

  /** Allows digits with an optional leading '+' only. */
  private readonly phonePattern = /^\+?[0-9]+$/;

  /** Holds the values and validation rules for the new contact form. */
  contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(this.namePattern)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(this.phonePattern)]]
  });

  /**
 * Normalizes and creates a contact, then navigates to its detail view.
 */
  async onSubmit(): Promise<void> {
    if (this.isSubmitting || !this.normalizeAndValidateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    try {
      await this.createAndEmitContact();
    } catch {
      this.errorMessage = 'Contact could not be saved. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Creates the contact and, on success, emits the creation event and closes the dialog.
   */
  private async createAndEmitContact(): Promise<void> {
    const createdContact = await this.createContact();
    if (!createdContact) {
      return;
    }

    this.contactCreated.emit(createdContact);
    this.closeDialog();
  }

  /** Trims form values and reports whether all validation rules pass. */
  private normalizeAndValidateForm(): boolean {
    const { name, email, phone } = this.contactForm.getRawValue();
    this.contactForm.patchValue({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
    });

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return false;
    }

    return true;
  }

  /** Creates a contact from the normalized form values. */
  private async createContact(): Promise<Contact | undefined> {
    const { data, error } = await this.submitContact();

    if (error) {
      this.errorMessage = this.mapContactErrorMessage(error);
      return undefined;
    }

    const createdContact = data?.[0] as Contact | undefined;
    if (!createdContact) {
      this.errorMessage = 'Contact could not be saved. Please try again.';
    }

    return createdContact;
  }

  /** Sends the normalized form values to the data service to create a contact. */
  private async submitContact() {
    const { name, email, phone } = this.contactForm.getRawValue();
    return this.dataService.addContact({
      contact_name: name,
      contact_mail: email,
      contact_phone: phone,
    });
  }

  /** Maps a contact-creation error to a user-facing error message. */
  private mapContactErrorMessage(error: { code: string }): string {
    return error.code === '23505'
      ? 'A contact with this email address already exists.'
      : 'Contact could not be saved. Please try again.';
  }

  /** Closes the dialog and clears its form state. */
  closeDialog(): void {
    this.contactForm.reset();
    this.errorMessage = null;
    this.closeRequested.emit();
  }

}
