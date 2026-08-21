import { Routes } from '@angular/router';
import { ContactDetails } from './pages/contacts/components/contact-details/contact-details';
import { Contacts } from './pages/contacts/contacts';

export const routes: Routes = [
    // Startseite auf Contacts weitergeleitet, damit der Router nicht leer bleibt.
    { path: '', pathMatch: 'full', redirectTo: 'contacts' },
    {
        path: 'contacts',
        component: Contacts,
        children: [
            { path: ':id', component: ContactDetails }   
        ]
    }
];
