import { Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

export interface Contact {
  id: number;
  created_at: string;
  contact_name: string;
  contact_mail: string;
  contact_phone: string;
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly supabaseUrl = 'https://kkenhlzyjmdlzwizszrh.supabase.co';
  private readonly supabaseKey = 'sb_publishable_maR6a2wWLdYDfnP8KuUOlw_CRqWZsff';
  private readonly supabase = createClient(this.supabaseUrl, this.supabaseKey);

  readonly contacts = signal<Contact[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  async getContacts(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const { data, error } = await this.supabase
        .from('ContactList')
        .select('id, created_at, contact_name, contact_mail, contact_phone');

      if (error) {
        this.error.set(error.message);
        return;
      }

      this.contacts.set(data ?? []);
    } catch {
      this.error.set('Connection to Supabase failed.');
    } finally {
      this.isLoading.set(false);
    }
  }


  async addContact(contact:{contact_name: string; contact_mail: string; contact_phone: string;}){
    const { data, error } = await this.supabase
  .from('ContactList')
  .insert([
    contact,
  ])
  .select()
  }
}
