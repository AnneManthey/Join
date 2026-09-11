import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Contact } from '../../shared/interfaces/contact';
import { Navbar } from '../../layout/navbar/navbar';
import { Header } from '../../layout/header/header';
import { ContactList } from './components/contact-list/contact-list';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-contacts',
  imports: [RouterOutlet, Navbar, Header, ContactList],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts {
  private readonly route = inject(ActivatedRoute);
  private router = inject(Router);
  private navigationEnd = toSignal(this.router.events, { initialValue: null });
  private successMessageTimer: ReturnType<typeof setTimeout> | undefined;
  private fadeOutTimer: ReturnType<typeof setTimeout> | undefined;
  readonly contactId = Number(this.route.snapshot.paramMap.get('id'));
  readonly contact = history.state['contact'] as Contact | undefined;
  readonly successMessage = history.state['successMessage'] as string | undefined;
  isSuccessMessageVisible = Boolean(this.successMessage);
  isSuccessMessageFading = false;

  hasSelectedContact = computed(() => {
    this.navigationEnd();
    return !!this.route.firstChild;
  });

  /** Initializes the success message timers when a contact action succeeded. */
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

  /** Navigates to the contacts overview. */
  routeToContacts() {
    this.router.navigate(['/contacts']);
  }

  /** Clears active success message timers when the component is destroyed. */
  ngOnDestroy(): void {
    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
    }

    if (this.fadeOutTimer) {
      clearTimeout(this.fadeOutTimer);
    }
  }
}
