import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Creates a validator that accepts only dates after the current day. */
export function futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null;

        const inputDate = new Date(control.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return inputDate > today ? null : { notFutureDate: true };
    };
}