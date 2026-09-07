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

export class LoginHome {
  authService = inject(AuthService);
  mailValidator = inject(AddContactDialog).emailDomainPattern;

  loginForm = new FormGroup({
    usermail: new FormControl('', { validators: [Validators.required, Validators.pattern(this.mailValidator)] }),
    password: new FormControl('', { validators: Validators.required }),
  });

  get usermail() {
    return this.loginForm.get('usermail');
  };

  get password() {
    return this.loginForm.get('password');
  };

  submitLogin() {
    if (this.loginForm.valid) {
      this.authService.signInWithEmail(this.usermail?.value ?? '', this.password?.value ?? '');
      this.clearLoginForm();
    }
  };

  clearLoginForm() {
    this.loginForm.reset();
  };
}
