import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContactList } from './pages/contacts/components/contact-list/contact-list';
import { AddContactDialog } from './pages/contacts/components/add-contact-dialog/add-contact-dialog';
import { SupabaseService } from './shared/services/supabase-service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ContactList, AddContactDialog],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  /**
   * Injected Supabase service used to communicate with the backend.
 */
  readonly dataService = inject(SupabaseService);

  /**
   * Loads contact data from Supabase when the application initializes.
 */
  ngOnInit(): void {
    void this.dataService.getContacts();

    // this.dataService.addContact({contact_name: 'Testi Testerine', contact_mail: 'test@testerine.com', contact_phone: '+49 555 5 55'});

    // this.dataService.editContact(2);

    // this.dataService.deleteContact(11);
  }
}
