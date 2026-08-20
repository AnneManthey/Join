import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Contact } from '../../../../shared/interfaces/contact';
import { SupabaseService } from '../../../../shared/services/supabase-service';
import { EditContactDialog } from '../edit-contact-dialog/edit-contact-dialog';

@Component({
  selector: 'app-contact-details',
  imports: [EditContactDialog],
  templateUrl: './contact-details.html',
  styleUrl: './contact-details.scss',
})
export class ContactDetails {
  @ViewChild('editContactDialog') editContactDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild(EditContactDialog) editContactComponent!: EditContactDialog;

  private readonly dialogAnimationDuration = 400;
  private closeDialogTimer: ReturnType<typeof setTimeout> | undefined;
  private activatedRoute = inject(ActivatedRoute);
  contactService = inject(SupabaseService);
  contacts: Contact[] = [];
  contact: Contact[] | undefined;
  // contactId: number | null;
  // constructor() {
  //   this.contactId = Number(this.activatedRoute.snapshot.paramMap.get('id'));
  //   this.contactService.contacts = this.contacts.filter(contact => contact.id);
  // }

  openEditContactDialog(): void {
    const dialog = this.editContactDialog.nativeElement;
    if (this.closeDialogTimer) {
      clearTimeout(this.closeDialogTimer);
      this.closeDialogTimer = undefined;
    }

    this.editContactComponent.isDialogOpen = true;
    dialog.classList.remove('edit-contact-dialog--closing');

    if (!dialog.open) {
      dialog.showModal();
    }
  }

  closeEditContactDialog(): void {
    const dialog = this.editContactDialog.nativeElement;
    dialog.classList.add('edit-contact-dialog--closing');
    this.closeDialogTimer = setTimeout(() => {
      this.editContactComponent.isDialogOpen = false;
      dialog.close();
      dialog.classList.remove('edit-contact-dialog--closing');
      this.closeDialogTimer = undefined;
    }, this.dialogAnimationDuration);
  }

  closeEditContactDialogOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeEditContactDialog();
    }
  }

  ngOnDestroy(): void {
    if (this.closeDialogTimer) {
      clearTimeout(this.closeDialogTimer);
    }
  }
}
