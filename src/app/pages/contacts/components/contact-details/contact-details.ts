import { Component, inject, computed, input } from '@angular/core';
import { SupabaseService } from '../../../../shared/services/supabase-service';
import { getColor } from '../../../../shared/utils/contacts-helper';
import { getChars } from '../../../../shared/utils/contacts-helper';

@Component({
  selector: 'app-contact-details',
  imports: [],
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
  getInitials(name: string | null | undefined): string {
    const names = name?.split(' ') ?? [];
    return (names[0]?.charAt(0) || '?') + (names[1]?.charAt(0) || '');
  }
  getChars = getChars;
  getColor = getColor;
}
