import { Routes } from '@angular/router';
import { AddContactDialog } from './pages/contacts/components/add-contact-dialog/add-contact-dialog';
import { Contacts } from './pages/contacts/contacts';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', component: AddContactDialog },
	{ path: 'contacts/:id', component: Contacts },
	{ path: '**', redirectTo: '' },
];
