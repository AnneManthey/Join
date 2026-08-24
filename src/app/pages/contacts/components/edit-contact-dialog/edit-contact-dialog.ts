import { Component, computed, effect, EventEmitter, inject, input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contact } from '../../../../shared/interfaces/contact';
import { SupabaseService } from '../../../../shared/services/supabase-service';
import { getColor } from '../../../../shared/utils/contacts-helper';
import { GetInitialsPipe } from '../../../../shared/pipes/get-initials-pipe';

@Component({
  selector: 'app-edit-contact-dialog',
  imports: [ReactiveFormsModule, GetInitialsPipe],
  templateUrl: './edit-contact-dialog.html',
  styleUrl: './edit-contact-dialog.scss',
})
export class EditContactDialog {

  /** Emits when the dialog should be closed. */
  @Output() closeRequested = new EventEmitter<void>();

  /** Emits after the selected contact was updated successfully. */
  @Output() contactUpdated = new EventEmitter<void>();

  /** Emits after the selected contact was deleted successfully. */
  @Output() contactDeleted = new EventEmitter<void>();

  /** Provides access to the shared contact data. */
  contactService = inject(SupabaseService);

  /** Contains the route id of the contact being edited. */
  id = input<string>();

  /** Finds the contact that belongs to the provided id. */
  contact = computed(() => {
    const currentId = this.id();
    if (!currentId) return undefined;
    return this.contactService.contacts().find(contact => contact.id === Number(currentId));
  });

  /** Creates the reactive contact form. */
  private fb = inject(FormBuilder);
  private readonly dataService = inject(SupabaseService);

  /** Indicates whether a save or delete request is in progress. */
  isSubmitting = false;

  /** Stores the latest contact creation error for display in the form. */
  errorMessage: string | null = null;

  /** Allows letters (incl. umlauts) and spaces only. */
  private readonly namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

  /** Allows digits with an optional leading '+' only. */
  private readonly phonePattern = /^\+?[0-9]+$/;

  /** Holds the values and validation rules for the contact form. */
  contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(this.namePattern)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(this.phonePattern)]]
  });

  /** Updates the form whenever the selected contact becomes available. */
  constructor() {
    effect(() => this.loadContactIntoForm());
  }

  /** Copies the selected contact into the form fields. */
  loadContactIntoForm(): void {
    const contact = this.contact();
    if (!contact) {
      return;
    }

    this.contactForm.patchValue({
      name: contact.contact_name,
      email: contact.contact_mail,
      phone: contact.contact_phone ?? '',
    });
  }

  /** Saves the changed values for the selected contact. */
async onSubmit(): Promise<void> {
  if (this.isSubmitting || !this.normalizeAndValidateForm()) {
    return;
  }

  this.isSubmitting = true;
  this.errorMessage = null;

  try {
    await this.updateAndEmitContact();
  } catch {
    this.errorMessage = 'Contact could not be saved. Please try again.';
  } finally {
    this.isSubmitting = false;
  }
}

/** Updates the contact and, on success, emits the update event and closes the dialog. */
private async updateAndEmitContact(): Promise<void> {
  const updated = await this.updateContact();
  if (!updated) {
    return;
  }

  this.contactUpdated.emit();
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

  /** Updates the selected contact with the normalized form values. */
private async updateContact(): Promise<Contact | undefined> {
  const contact = this.contact();
  if (!contact) {
    return undefined;
  }

  const { data, error } = await this.submitContactUpdate(contact.id);
  return this.resolveUpdatedContact(data, error);
}

/** Sends the normalized form values to the data service to update the given contact. */
private async submitContactUpdate(contactId: number) {
  const { name, email, phone } = this.contactForm.getRawValue();
  return this.dataService.editContact(contactId, {
    contact_name: name,
    contact_mail: email,
    contact_phone: phone,
  });
}

/** Resolves the updated contact from the service response, setting an error message on failure. */
private resolveUpdatedContact(data: unknown, error: { code: string } | null): Contact | undefined {
  if (error) {
    this.errorMessage = error.code === '23505'
      ? 'A contact with this email address already exists.'
      : 'Contact could not be saved. Please try again.';
    return undefined;
  }

  const updatedContact = (data as { [index: number]: Contact })?.[0];
  if (!updatedContact) {
    this.errorMessage = 'Contact could not be saved. Please try again.';
  }

  return updatedContact;
}

  /** Deletes the selected contact from Supabase. */
async deleteContact(): Promise<void> {
  const contact = this.contact();
  if (!contact || this.isSubmitting) {
    return;
  }

  this.isSubmitting = true;
  this.errorMessage = null;

  try {
    await this.performDelete(contact.id);
  } catch {
    this.errorMessage = 'Contact could not be deleted. Please try again.';
  } finally {
    this.isSubmitting = false;
  }
}

/** Sends the delete request and, on success, emits the deletion event and closes the dialog. */
private async performDelete(contactId: number): Promise<void> {
  const { error } = await this.dataService.deleteContact(contactId);
  if (error) {
    this.errorMessage = 'Contact could not be deleted. Please try again.';
    return;
  }

  this.contactDeleted.emit();
  this.closeDialog();
}

  /** Closes the dialog and restores the saved contact values. */
  closeDialog(): void {
    this.loadContactIntoForm();
    this.errorMessage = null;
    this.closeRequested.emit();
  }

  getColor = getColor;

}
