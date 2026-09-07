import { Component, inject } from '@angular/core';
import { AuthService } from '../../shared/services/auth-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Register } from './components/register/register';

@Component({
  selector: 'app-login-home',
  imports: [ReactiveFormsModule, Register],
  templateUrl: './login-home.html',
  styleUrl: './login-home.scss',
})
export class LoginHome {
  authService = inject(AuthService);

  loginForm = new FormGroup({
    usermail: new FormControl('', { validators: Validators.required }),
    password: new FormControl('', { validators: Validators.required }),
  });

  get usermail() {
    return this.loginForm.get('usermail');
  };

  get password() {
    return this.loginForm.get('password');
  };

  submitLogin() {
    this.authService.signInWithEmail(this.usermail?.value ?? '', this.password?.value ?? '')
  }
}
