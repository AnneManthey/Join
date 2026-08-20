import { Injectable, signal } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Contact } from '../interfaces/contact';

@Injectable({ providedIn: 'root' })

export class SupabaseService {
  /**
   * Supabase project URL used for all database requests.
   */
  private readonly supabaseUrl = 'https://kkenhlzyjmdlzwizszrh.supabase.co';

  /**
   * Publishable anon key used to authenticate requests.
   */
  private readonly supabaseKey = 'sb_publishable_maR6a2wWLdYDfnP8KuUOlw_CRqWZsff';

  /**
   * Shared Supabase client instance.
   */
  private readonly supabase = createClient(this.supabaseUrl, this.supabaseKey);

  /**
   * Active realtime channel subscription.
   */
  channels: RealtimeChannel | undefined;

  /**
   * Cached list of contacts loaded from the database.
   */
  readonly contacts = signal<Contact[]>([]);

  /**
   * Indicates whether a data request is currently in progress.
   */
  readonly isLoading = signal(false);

  /**
   * Stores the latest request error message, if any.
   */
  readonly error = signal<string | null>(null);

  /**
   * Fetches all contacts from the ContactList table and updates the signal state.
   *
   * @returns A promise that resolves when the fetch operation completes.
   */
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

    this.channels = this.supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ContactList' },
        (payload) => {
          // console.log('Change received!', payload)

          switch (payload.eventType) {

            case 'INSERT':
              this.contacts.update(current => [...current, payload.new as Contact]);
              break;
            case 'UPDATE':
              this.contacts.update(current =>
                current.map(contact =>
                  contact.id === (payload.new as Contact).id ? payload.new as Contact : contact
                )
              );
              break;
            case 'DELETE':
              this.contacts.update(current =>
                current.filter(contact => contact.id !== (payload.old as Contact).id)
              );
              break;
          }
        }
      )
      .subscribe()
  }

  /**
   * Removes the realtime channel subscription when the service is destroyed.
   */
  ngOnDestroy(): void {
    if (this.channels) {
      this.supabase.removeChannel(this.channels);
    }
    // unsubscribe(timeout)
  }

  /**
   * Inserts a new contact into the ContactList table.
   *
   * @param contact The contact data without the generated database fields.
   * @returns A promise resolving with the inserted record data.
   */
  async addContact(contact: Omit<Contact, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('ContactList')
      .insert([
        contact,
      ])
      .select();

    return { data, error };
  }

  /**
   * Updates the email address for a contact identified by its id.
   *
   * @param id The unique identifier of the contact.
   * @returns A promise resolving with the updated contact data.
   */
  async editContact(id: number) {
    const { data, error } = await this.supabase
      .from('ContactList')
      .update({ contact_mail: 'new@email.com' })
      .eq('id', id)
      .select();

    return { data, error };
  }

  /**
   * Deletes a contact by its id.
   *
   * @param id The unique identifier of the contact to remove.
   * @returns A promise resolving with the deletion result.
   */
  async deleteContact(id: number) {
    const { error } = await this.supabase
      .from('ContactList')
      .delete()
      .eq('id', id);

    return { error };
  }
}
