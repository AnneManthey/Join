import { Routes } from '@angular/router';
import { Board } from './pages/board/board';
import { ContactDetails } from './pages/contacts/components/contact-details/contact-details';
import { Contacts } from './pages/contacts/contacts';
import { AddTask } from './pages/add-task/add-task';
import { LegalNotice } from './pages/legal-notice/legal-notice';
import { LoginHome } from './pages/login-home/login-home';
import { authGuard } from './shared/guards/auth-guard';
import { Register } from './pages/login-home/components/register/register';
import { Summary } from './pages/summary/summary';

export const routes: Routes = [
    // Startseite auf Contacts weitergeleitet, damit der Router nicht leer bleibt.
    // { path: '', pathMatch: 'full', redirectTo: 'contacts' },
    {
        path: '',
        component: LoginHome
    },
    {
        path: 'register',
        component: Register
    },
    {
        path: 'addtask',
        component: AddTask,
        canActivate: [authGuard]
    },
    {
        path: 'board',
        component: Board,
        canActivate: [authGuard]
    },
    {
        path: 'summary',
        component: Summary,
        canActivate: [authGuard]
    },
    {
        path: 'contacts',
        component: Contacts,
        children: [
            { path: ':id', component: ContactDetails }
        ],
        canActivate: [authGuard]
    },
    {
        path: 'legal-notice',
        component: LegalNotice
    }
];
