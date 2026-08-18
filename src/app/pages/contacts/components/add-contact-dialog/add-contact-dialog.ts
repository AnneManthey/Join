import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-contact-dialog',
  imports: [ReactiveFormsModule],
  templateUrl: './add-contact-dialog.html',
  styleUrl: './add-contact-dialog.scss',
})
export class AddContactDialog {
  private fb = inject(FormBuilder);

  contactForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['']
  });

  onSubmit(): void {
    if (this.contactForm.valid) {
      const contactData = this.contactForm.value;
      // Hier der Aufruf an deinen Supabase Service
    }
  }

  onCancel(): void {
    this.contactForm.reset();
  }

}
