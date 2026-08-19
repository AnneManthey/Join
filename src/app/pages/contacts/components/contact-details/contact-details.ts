import { Component, inject } from '@angular/core';
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
  contacts: Contact[] = [];
  contact: Contact[] | undefined;
  // contactId: number | null;
  // constructor() {
  //   this.contactId = Number(this.activatedRoute.snapshot.paramMap.get('id'));
  //   this.contactService.contacts = this.contacts.filter(contact => contact.id);
  // }
  
}
