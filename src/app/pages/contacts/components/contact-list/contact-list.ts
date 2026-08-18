import { Component, inject, computed } from '@angular/core';
import { SupabaseService } from '../../../../shared/services/supabase-service';
import { Contact } from '../../../../shared/interfaces/contact';

@Component({
  selector: 'app-contact-list',
  imports: [],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})

export class ContactList {
  contactService = inject(SupabaseService);
  contacts: Contact[] = [];

  /** 
   * Loads the contact list from Supabase once the component is initialized. 
   */
  async ngOnInit() {
    await this.contactService.getContacts();
  }

  /** 
   * Alphabetically sorted copy of the contacts from {@link SupabaseService.contacts}. 
   * Recomputes automatically whenever the underlying signal changes 
   * (e.g. after a realtime update). 
   * 
   * Uses `localeCompare` so accented characters (e.g. Ö) sort correctly. 
   */
  sortedContacts = computed(() => {
    const copy = [...this.contactService.contacts()];
    copy.sort((a, b) => a.contact_name.localeCompare(b.contact_name));
    return copy;
  });

  /** 
   * Groups {@link sortedContacts} by the uppercase first letter of `contact_name`. 
   * Recomputes automatically whenever {@link sortedContacts} changes. 
   * 
   * @returns An array of `[letter, contacts]` tuples, e.g. `['A', [contact1, contact2]]`, 
   * ready to iterate over with `@for` in the template. 
   */
  // was hier rauskommt: [  
  //   ['A', [{ name: 'Anton Mayer', ... }]],  
  //   ['B', [{ name: 'Barbara...', ... }, { name: 'Benedikt...', ... }]]  
  // ]  
  firstLetter = computed(() => {
    const grouped = Object.groupBy(
      this.sortedContacts(),
      (contact) => contact.contact_name.charAt(0).toUpperCase()
    ) as Record<string, { contact_name: string; contact_mail: string }[]>;
    return Object.entries(grouped);
  });

  // // to do: fallback, falls nur ein name existiert 
  // // to do: als pipe auslagern 
  /** 
 * Returns the initials (first letter of first and last name) for a given contact name. 
 * 
 * @param name - Full name, expected to contain at least a first and last name separated by a space. 
 * @returns A two-character string of uppercase initials, e.g. `'AM'` for `'Anton Mayer'`. 
 * 
 * @todo Handle names consisting of a single word (no last name). 
 * @todo Extract as a pipe for reuse outside this component. 
 */
  getInitials(name: string) {
    let names = name.split(' ');
    let initials = names[0].charAt(0) + names[1].charAt(0);
    return initials;
  }
} 