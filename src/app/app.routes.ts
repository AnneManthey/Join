import { Routes } from '@angular/router';
import { Board } from './pages/board/board';
import { ContactDetails } from './pages/contacts/components/contact-details/contact-details';
import { Contacts } from './pages/contacts/contacts';
import { AddTask } from './pages/add-task/add-task';
import { LoginHome } from './pages/login-home/login-home';

export const routes: Routes = [
    // Startseite auf Contacts weitergeleitet, damit der Router nicht leer bleibt.
    // { path: '', pathMatch: 'full', redirectTo: 'contacts' },
    {
        path: '',
        component: LoginHome
    },
    {
        path: 'addtask',
        component: AddTask
    },
    {
        path: 'board',
        component: Board
    },
    {
        path: 'contacts',
        component: Contacts,
        children: [
            { path: ':id', component: ContactDetails }
        ]
    }
];
