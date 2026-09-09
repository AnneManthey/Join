import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../../shared/services/auth-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { confirmPasswordValidator } from '../../../../shared/utils/confirm-password-validator';
import { AddContactDialog } from '../../../contacts/components/add-contact-dialog/add-contact-dialog';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  providers: [AddContactDialog]
})
/** Displays the registration form and creates new user accounts. */
export class Register {
  /** Provides registration actions and state for the registration view. */
  authService = inject(AuthService);

  /** Whether the password is currently shown as plain text instead of masked. */
  isPasswordVisible = signal(false);

  /** Whether the confirm-password is currently shown as plain text instead of masked. */
  isConfirmPasswordVisible = signal(false);


  /** Whether the password input is currently focused. */
  isFocused = signal(false);

  /** Whether the confirm-password input is currently focused. */
  isConfirmFocused = signal(false);


  /** Pattern used to validate the display name. */
  nameValidator = inject(AddContactDialog).namePattern;

  /** Pattern used to validate the registration email address. */
  mailValidator = inject(AddContactDialog).emailDomainPattern;

  /** Requires at least 8 characters with no spaces, including at least one digit or special character. */
  private readonly passwordValidator = /^(?!.*\s)(?=.*[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  /** Reactive form containing the registration data and policy consent. */
  registerForm = new FormGroup({
    registerUsername: new FormControl('', { validators: [Validators.required, Validators.pattern(this.nameValidator)] }),
    registerUsermail: new FormControl('', { validators: [Validators.required, Validators.pattern(this.mailValidator)] }),
    registerPassword: new FormControl('', { validators: [Validators.required, Validators.pattern(this.passwordValidator)] }),
    confirmPassword: new FormControl('', { validators: Validators.required }),
    registerPolicy: new FormControl(false, { validators: Validators.requiredTrue }),
  }, { validators: [confirmPasswordValidator()] });

  /** Returns the username form control. */
  get registerUsername() {
    return this.registerForm.get('registerUsername');
  };

  /** Returns the registration email form control. */
  get registerUsermail() {
    return this.registerForm.get('registerUsermail');
  };

  /** Returns the registration password form control. */
  get registerPassword() {
    return this.registerForm.get('registerPassword');
  };

  /** Returns the privacy policy consent form control. */
  get registerPolicy() {
    return this.registerForm.get('registerPolicy');
  };

  /** Returns the password confirmation form control. */
  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  };

  /** Submits valid registration data to the authentication service. */
  submitRegister() {
    if (this.registerForm.valid) {
      this.authService.signUpNewUser(this.registerUsername?.value ?? '', this.registerUsermail?.value ?? '', this.registerPassword?.value ?? '');
      this.clearRegisterForm();
    } else {
      this.registerForm.markAllAsTouched();
    }
  };

  /** Resets all fields in the registration form. */
  clearRegisterForm() {
    this.registerForm.reset();
  }

  /** Toggles the visibility of the password between masked and plain text. */
  togglePasswordVisibility() {
    this.isPasswordVisible.update(visible => !visible);
  }

  /** Toggles the visibility of the confirm-password between masked and plain text. */
  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible.update(visible => !visible);
  }
}
