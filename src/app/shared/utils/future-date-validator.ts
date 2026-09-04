import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null;

        const inputDate = new Date(control.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return inputDate > today ? null : { notFutureDate: true };
    };
}