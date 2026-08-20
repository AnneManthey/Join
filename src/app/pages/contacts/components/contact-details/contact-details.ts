import { Component, inject, computed, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Contact } from '../../../../shared/interfaces/contact';
import { SupabaseService } from '../../../../shared/services/supabase-service';

@Component({
  selector: 'app-contact-details',
  imports: [],
  templateUrl: './contact-details.html',
  styleUrl: './contact-details.scss',
})
export class ContactDetails {
  private activatedRoute = inject(ActivatedRoute);
  contactService = inject(SupabaseService);
  // contacts: Contact[] = [];
  id = input<string>();
  contact = computed(() => {
    const currentId = this.id();
    if (!currentId) return undefined;
    return this.contactService.contacts().find(contact => contact.id === Number(currentId));
  });
  // contactId: number = Number(this.activatedRoute.snapshot.paramMap.get('id'));
  colors = ["#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8", "#1FD7C1", "#FF745E", "#FC71FF", "#FFC701", "#0038FF", "#C3FF2B", "#FFE62B", "#FF4646", "#FFBB2B"];


  getInitials(name: string | null | undefined): string {
    const names = name?.split(' ') ?? [];
    return (names[0]?.charAt(0) || '?') + (names[1]?.charAt(0) || '');
  }
  consoleLog() {
    console.log(this.contact())
  }

  /**
 * Determines a color from the available color list based on a name.
 *
 * The sum of the name's character codes is used with the modulo operator
 * to calculate a valid index within the colors array.
 *
 * @param name - The name used to determine the color.
 * @returns The color assigned to the given name.
 */
  getColor(name: string) {
    let sum = this.getChars(name);
    let colorIndex = sum % this.colors.length;
    return this.colors[colorIndex];
  };

  /**
* Calculates a numeric sum from the UTF-16 character codes of a name.
*
* Each character of the name is converted to its corresponding character
* code using `charCodeAt()` and added to the total sum.
*
* @param name - The name whose character codes should be summed.
* @returns The sum of all UTF-16 character codes of the name.
*/
  getChars(name: string) {
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i)
    }
    return sum;
  };
}
