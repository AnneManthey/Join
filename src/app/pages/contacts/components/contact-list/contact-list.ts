import { ChangeDetectorRef, Component, ElementRef, inject, computed, ViewChild } from '@angular/core';
import { SupabaseService } from '../../../../shared/services/supabase-service';
import { Contact } from '../../../../shared/interfaces/contact';
import { Router } from '@angular/router';
import { AddContactDialog } from '../add-contact-dialog/add-contact-dialog';
import { getColor } from '../../../../shared/utils/contacts-helper';
import { getChars } from '../../../../shared/utils/contacts-helper';
import { GetInitialsPipe } from '../../../../shared/pipes/get-initials-pipe';

@Component({
  selector: 'app-contact-list',
  imports: [AddContactDialog, GetInitialsPipe],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})

export class ContactList {
  private router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
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
  getChars = getChars;
  getColor = getColor;


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

  /**
   * Marks the given contact as selected and navigates to its detail view.
   *
   * @param id - The id of the contact to select and display.
   */
  selectContact(id: number) {
    this.selectedContactId = id;
    this.router.navigate(['/contacts', id]);
  }

  openAddContactDialog() {
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

  closeAddContactDialogOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
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
      this.changeDetector.markForCheck();
      this.successMessageFadeTimer = setTimeout(() => {
        this.isSuccessMessageVisible = false;
        this.successMessage = '';
        this.changeDetector.markForCheck();
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