import { Component, inject, computed, input } from '@angular/core';
import { SupabaseService } from '../../../../shared/services/supabase-service';
import { getColor } from '../../../../shared/utils/contacts-helper';
import { getChars } from '../../../../shared/utils/contacts-helper';
import { GetInitialsPipe } from '../../../../shared/pipes/get-initials-pipe';

@Component({
  selector: 'app-contact-details',
  imports: [GetInitialsPipe],
  templateUrl: './contact-details.html',
  styleUrl: './contact-details.scss',
})
export class ContactDetails {
  contactService = inject(SupabaseService);
  id = input<string>();
  contact = computed(() => {
    const currentId = this.id();
    if (!currentId) return undefined;
    return this.contactService.contacts().find(contact => contact.id === Number(currentId));
  });

  getChars = getChars;
  getColor = getColor;
}
