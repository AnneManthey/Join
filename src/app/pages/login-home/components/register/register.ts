import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../shared/services/auth-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { confirmPasswordValidator } from '../../../../shared/utils/confirm-password-validator';
import { AddContactDialog } from '../../../contacts/components/add-contact-dialog/add-contact-dialog';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  providers: [AddContactDialog]
})
export class Register {
  authService = inject(AuthService);
  nameValidator = inject(AddContactDialog).namePattern;
  mailValidator = inject(AddContactDialog).emailDomainPattern;

  registerForm = new FormGroup({
    registerUsername: new FormControl('', { validators: [Validators.required, Validators.pattern(this.nameValidator)] }),
    registerUsermail: new FormControl('', { validators: [Validators.required, Validators.pattern(this.mailValidator)] }),
    registerPassword: new FormControl('', { validators: Validators.required }),
    confirmPassword: new FormControl('', { validators: Validators.required }),
    registerPolicy: new FormControl(false, { validators: Validators.requiredTrue }),
  }, { validators: [confirmPasswordValidator()] });

  get registerUsername() {
    return this.registerForm.get('registerUsername');
  };

  get registerUsermail() {
    return this.registerForm.get('registerUsermail');
  };

  get registerPassword() {
    return this.registerForm.get('registerPassword');
  };

  get registerPolicy() {
    return this.registerForm.get('registerPolicy');
  };

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  };

  submitRegister() {
    if (this.registerForm.valid) {
      this.authService.signUpNewUser(this.registerUsermail?.value ?? '', this.registerPassword?.value ?? '');
      this.clearRegisterForm();
    }
  };

  clearRegisterForm() {
    this.registerForm.reset();
  }
}
