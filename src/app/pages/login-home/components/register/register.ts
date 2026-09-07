import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../shared/services/auth-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  authService = inject(AuthService);

  registerForm = new FormGroup({
    registerUsername: new FormControl('', { validators: Validators.required }),
    registerUsermail: new FormControl('', { validators: Validators.required }),
    registerPassword: new FormControl('', { validators: Validators.required }),
  });

  get registerUsername() {
    return this.registerForm.get('registerUsername');
  };

  get registerUsermail() {
    return this.registerForm.get('registerUsermail');
  };

  get registerPassword() {
    return this.registerForm.get('registerPassword');
  };

  submitRegister() {
    this.authService.signUpNewUser(this.registerUsermail?.value ?? '', this.registerPassword?.value ?? '');
  };
}
