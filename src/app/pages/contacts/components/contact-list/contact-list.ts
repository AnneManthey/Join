import { Component, ElementRef, inject, computed, ViewChild } from '@angular/core';
import { SupabaseService } from '../../../../shared/services/supabase-service';
import { Contact } from '../../../../shared/interfaces/contact';
import { AddContactDialog } from '../add-contact-dialog/add-contact-dialog';

@Component({
  selector: 'app-contact-list',
  imports: [AddContactDialog],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})

export class ContactList {
  @ViewChild('addContactDialog') addContactDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild(AddContactDialog) addContactComponent!: AddContactDialog;

  private readonly dialogAnimationDuration = 400;
  private closeDialogTimer: ReturnType<typeof setTimeout> | undefined;
  private successMessageTimer: ReturnType<typeof setTimeout> | undefined;
  private successMessageFadeTimer: ReturnType<typeof setTimeout> | undefined;
  successMessage = '';
  isSuccessMessageVisible = false;
  isSuccessMessageFading = false;

  contactService = inject(SupabaseService);
  contacts: Contact[] = [];
  colors = ["#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8", "#1FD7C1", "#FF745E", "#FC71FF", "#FFC701", "#0038FF", "#C3FF2B", "#FFE62B", "#FF4646", "#FFBB2B"];
  selectedContactId: number | null = null;

  /** 
   * Loads the contact list from Supabase once the component is initialized. 
   */
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
  firstLetter = computed(() => {
    const grouped = Object.groupBy(
      this.sortedContacts(),
      (contact) => (contact.contact_name?.charAt(0) || '#').toUpperCase()
    ) as Record<string, Contact[]>;
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
  getInitials(name: string | null | undefined): string {
    const names = name?.split(' ') ?? [];
    return (names[0]?.charAt(0) || '?') + (names[1]?.charAt(0) || '');
  }

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

  selectContact(id:number) {
    this.selectedContactId = id;
  }

  openAddContactDialog(){
    const dialog = this.addContactDialog.nativeElement;
    this.successMessage = '';
    if (this.closeDialogTimer) {
      clearTimeout(this.closeDialogTimer);
      this.closeDialogTimer = undefined;
    }
    this.addContactComponent.isDialogOpen = true;
    dialog.classList.remove('add-contact-dialog--closing');
    if (!dialog.open) {
      dialog.showModal();
    }
  }

  closeAddContactDialog(): void {
    const dialog = this.addContactDialog.nativeElement;
    dialog.classList.add('add-contact-dialog--closing');
    this.closeDialogTimer = setTimeout(() => {
      this.addContactComponent.isDialogOpen = false;
      dialog.close();
      dialog.classList.remove('add-contact-dialog--closing');
      this.closeDialogTimer = undefined;
    }, this.dialogAnimationDuration);
  }

  closeOnBackdropClick(event: MouseEvent): void {
    if (event.target === this.addContactDialog.nativeElement) {
      this.closeAddContactDialog();
    }
  }

  showContactCreatedMessage(): void {
    this.successMessage = 'Contact successfully created.';
    this.isSuccessMessageVisible = true;
    this.isSuccessMessageFading = false;

    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
    }
    if (this.successMessageFadeTimer) {
      clearTimeout(this.successMessageFadeTimer);
    }

    this.successMessageTimer = setTimeout(() => {
      this.isSuccessMessageFading = true;
      this.successMessageFadeTimer = setTimeout(() => {
        this.isSuccessMessageVisible = false;
        this.successMessage = '';
      }, 250);
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
    }
    if (this.successMessageFadeTimer) {
      clearTimeout(this.successMessageFadeTimer);
    }
  }
} 