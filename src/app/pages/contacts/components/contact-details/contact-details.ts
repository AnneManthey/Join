import { Component, ElementRef, inject, ViewChild, computed, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Contact } from '../../../../shared/interfaces/contact';
import { SupabaseService } from '../../../../shared/services/supabase-service';
import { EditContactDialog } from '../edit-contact-dialog/edit-contact-dialog';
import { getColor } from '../../../../shared/utils/contacts-helper';
import { getChars } from '../../../../shared/utils/contacts-helper';
import { GetInitialsPipe } from '../../../../shared/pipes/get-initials-pipe';

@Component({
  selector: 'app-contact-details',
  imports: [GetInitialsPipe, EditContactDialog],
  templateUrl: './contact-details.html',
  styleUrl: './contact-details.scss',
})
export class ContactDetails {
  @ViewChild('editContactDialog') editContactDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild(EditContactDialog) editContactComponent!: EditContactDialog;

  private readonly dialogAnimationDuration = 400;
  private closeDialogTimer: ReturnType<typeof setTimeout> | undefined;
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  contactService = inject(SupabaseService);
  getChars = getChars;
  getColor = getColor;
  id = input<string>();
  contact = computed(() => {
    const currentId = this.id();
    if (!currentId) return undefined;
    return this.contactService.contacts().find(contact => contact.id === Number(currentId));
  });

  /** Opens the edit dialog and loads the current contact into its form. */
  openEditContactDialog(): void {
    const dialog = this.editContactDialog.nativeElement;
    if (this.closeDialogTimer) {
      clearTimeout(this.closeDialogTimer);
      this.closeDialogTimer = undefined;
    }

    this.editContactComponent.loadContactIntoForm();
    dialog.classList.remove('edit-contact-dialog--closing');

    if (!dialog.open) {
      dialog.showModal();
    }
  }

  /** Closes the edit dialog with its closing animation. */
  closeEditContactDialog(): void {
    const dialog = this.editContactDialog.nativeElement;
    dialog.classList.add('edit-contact-dialog--closing');
    this.closeDialogTimer = setTimeout(() => {
      dialog.close();
      dialog.classList.remove('edit-contact-dialog--closing');
      this.closeDialogTimer = undefined;
    }, this.dialogAnimationDuration);
  }

  /** Closes the dialog when the user clicks on its backdrop. */
  closeEditContactDialogOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeEditContactDialog();
    }
  }

  /** Navigates back to the contact list after a contact was deleted in the dialog. */
  handleContactDeleted(): void {
    void this.router.navigate(['/contacts']);
  }

  /** Deletes the currently displayed contact and returns to the contact list. */
  async deleteContact(): Promise<void> {
    const contact = this.contact();
    if (!contact) {
      return;
    }

    const { error } = await this.contactService.deleteContact(contact.id);
    if (!error) {
      await this.router.navigate(['/contacts']);
    }
  }

  /** Clears the pending dialog close timer when the component is destroyed. */
  ngOnDestroy(): void {
    if (this.closeDialogTimer) {
      clearTimeout(this.closeDialogTimer);
    }
  }

  optionsOpen = false;

  toggleOptions() {
    this.optionsOpen = !this.optionsOpen;
  }

  closeOptions() {
    if (this.optionsOpen) {
      this.optionsOpen = !this.optionsOpen;
    }
  }
}
