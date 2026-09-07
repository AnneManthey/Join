import { Component, inject } from '@angular/core';
import { AuthService } from '../../shared/services/auth-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddContactDialog } from '../contacts/components/add-contact-dialog/add-contact-dialog';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-login-home',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-home.html',
  styleUrl: './login-home.scss',
  providers: [AddContactDialog]
})

/** Displays the login form and starts email-based authentication. */
export class LoginHome {
  /** Provides authentication actions and state for the login view. */
  authService = inject(AuthService);
  /** Pattern used to validate the login email address. */
  mailValidator = inject(AddContactDialog).emailDomainPattern;

  /** Reactive form containing the user's login credentials. */
  loginForm = new FormGroup({
    usermail: new FormControl('', { validators: [Validators.required, Validators.pattern(this.mailValidator)] }),
    password: new FormControl('', { validators: Validators.required }),
  });

  /** Returns the email form control. */
  get usermail() {
    return this.loginForm.get('usermail');
  };

  /** Returns the password form control. */
  get password() {
    return this.loginForm.get('password');
  };

  /** Submits valid credentials to the authentication service. */
  submitLogin() {
    if (this.loginForm.valid) {
      this.authService.signInWithEmail(this.usermail?.value ?? '', this.password?.value ?? '');
      this.clearLoginForm();
    }
  };

  /** Resets all fields in the login form. */
  clearLoginForm() {
    this.loginForm.reset();
  };
}
