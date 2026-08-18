import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContactList } from './pages/contacts/components/contact-list/contact-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ContactList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('join');
}
