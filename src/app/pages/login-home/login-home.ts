import { Component, inject, signal } from '@angular/core';
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

  /** Whether the password is currently shown as plain text instead of masked. */
  isPasswordVisible = signal(false);

  /** Whether the password input is currently focused. */
  isFocused = signal(false);

  /** Pattern used to validate the login email address. */
  mailValidator = inject(AddContactDialog).emailDomainPattern;

  /** Controls whether the splash overlay exists in the DOM at all. */
  showOverlay = signal(true);

  /** Controls whether the overlay is currently fading out (triggers the CSS transition). */
  isFadingOut = signal(false);

  ngOnInit() {
    setTimeout(() => {
      this.isFadingOut.set(true);
    }, 1000);
  }

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

  /**
   * Submits valid credentials and clears the form only after a successful login.
   * This keeps the entered email visible when authentication fails and the user can retry.
   */
  async submitLogin() {
    if (this.loginForm.valid) {
      const success = await this.authService.signInWithEmail(this.usermail?.value ?? '', this.password?.value ?? '');
      if (success) {
        this.clearLoginForm();
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  };

  /** Resets all fields in the login form. */
  clearLoginForm() {
    this.loginForm.reset();
  };

  /** Toggles the visibility of the password between masked and plain text. */
  togglePasswordVisibility() {
    this.isPasswordVisible.update(visible => !visible);
  };

  /** Called once the CSS opacity transition on the overlay finishes. */
  onOverlayTransitionEnd() {
    this.showOverlay.set(false);
  }
}
