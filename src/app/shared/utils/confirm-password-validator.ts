
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Creates a validator that checks whether the password fields match. */
export function confirmPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const password = control.get('registerPassword')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;

        return password === confirmPassword ? null : { passwordMismatch: true };
    };
}