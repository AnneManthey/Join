import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AddContactDialog } from './components/add-contact-dialog/add-contact-dialog';
import { Contact } from '../../shared/interfaces/contact';
import { ContactDetails } from "./components/contact-details/contact-details";
import { Navbar } from '../../layout/navbar/navbar';
import { Header } from '../../layout/header/header';
import { ContactList } from './components/contact-list/contact-list';

@Component({
  selector: 'app-contacts',
  imports: [AddContactDialog, RouterOutlet, Navbar, Header, ContactList],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts {
  private readonly route = inject(ActivatedRoute);
  private successMessageTimer: ReturnType<typeof setTimeout> | undefined;
  private fadeOutTimer: ReturnType<typeof setTimeout> | undefined;

  readonly contactId = Number(this.route.snapshot.paramMap.get('id'));
  readonly contact = history.state['contact'] as Contact | undefined;
  readonly successMessage = history.state['successMessage'] as string | undefined;
  isSuccessMessageVisible = Boolean(this.successMessage);
  isSuccessMessageFading = false;

  constructor() {
    if (this.successMessage) {
      this.successMessageTimer = setTimeout(() => {
        this.isSuccessMessageFading = true;
        this.fadeOutTimer = setTimeout(() => {
          this.isSuccessMessageVisible = false;
        }, 250);
      }, 3000);
    }
  }

  ngOnDestroy(): void {
    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
    }

    if (this.fadeOutTimer) {
      clearTimeout(this.fadeOutTimer);
    }
  }
}
