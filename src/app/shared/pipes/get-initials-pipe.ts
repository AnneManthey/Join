import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getInitials',
})
export class GetInitialsPipe implements PipeTransform {
  name = "getInitials"
  /** 
 * Returns the initials (first letter of first and last name) for a given contact name. 
 * 
 * @param name - Full name, expected to contain at least a first and last name separated by a space. 
 * @returns A two-character string of uppercase initials, e.g. `'AM'` for `'Anton Mayer'`. 
 */
  transform(name: string | null | undefined): string {
    const names = name?.split(' ') ?? [];
    return (names[0]?.charAt(0) || '?') + (names[1]?.charAt(0) || '');
  }
}

