/** Represents a contact stored in the contact list. */
export interface Contact {
    id: number;
    created_at: string;
    contact_name: string;
    contact_mail: string;
    contact_phone: string | null;
}
