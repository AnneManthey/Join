import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Contact } from '../../../../shared/interfaces/contact';
import { SupabaseService } from '../../../../shared/services/supabase-service';

@Component({
  selector: 'app-add-contact-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './add-contact-dialog.html',
  styleUrl: './add-contact-dialog.scss',
})
export class AddContactDialog {
  private fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly dataService = inject(SupabaseService);

  isSubmitting = false;
  errorMessage: string | null = null;

  contactForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['']
  });

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) {
      return;
    }

    const { name, email, phone } = this.contactForm.getRawValue();
    this.contactForm.patchValue({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
    });

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const normalizedContact = this.contactForm.getRawValue();
    const contact = {
      contact_name: normalizedContact.name,
      contact_mail: normalizedContact.email,
      contact_phone: normalizedContact.phone || null,
    };

    this.isSubmitting = true;
    this.errorMessage = null;

    try {
      const { data, error } = await this.dataService.addContact(contact);

      if (error) {
        this.errorMessage = error.code === '23505'
          ? 'A contact with this email address already exists.'
          : 'Contact could not be saved. Please try again.';
        return;
      }

      const createdContact = data?.[0] as Contact | undefined;
      if (!createdContact) {
        this.errorMessage = 'Contact could not be saved. Please try again.';
        return;
      }

      this.contactForm.reset();
      await this.router.navigate(['/contacts', createdContact.id], {
        state: {
          contact: createdContact,
          successMessage: 'Contact created successfully.',
        },
      });
    } catch {
      this.errorMessage = 'Contact could not be saved. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.contactForm.reset();
  }

}
