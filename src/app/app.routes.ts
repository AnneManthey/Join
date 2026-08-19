import { Routes } from '@angular/router';
import { ContactDetails } from './pages/contacts/components/contact-details/contact-details';
import { Contacts } from './pages/contacts/contacts';
import { ContactDetailPlaceholder } from './pages/contacts/components/contact-detail-placeholder/contact-detail-placeholder';

export const routes: Routes = [
    {
        path: 'contacts',
        component: Contacts,
        children: [
            { path: '', component: ContactDetailPlaceholder },       // "Contacts – Better with a team"
            { path: ':id', component: ContactDetails }   
        ]
    }
];
