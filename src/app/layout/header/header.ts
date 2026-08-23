
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../shared/services/supabase-service';
import { GetInitialsPipe } from '../../shared/pipes/get-initials-pipe';
@Component({
  selector: 'app-header',
  imports: [RouterLink, GetInitialsPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  // Saves the current URL
  // Only updates when a signal changes
  private currentUrl = signal(this.router.url);
  constructor() {
    this.router.events.subscribe(() => {
      this.currentUrl.set(this.router.url);
    });
  }
  // Retrieves the name directly from the current URL and the contact list 
  contactName = computed(() => {
    const url = this.currentUrl(); // z.B. "/contacts/3"
    const id = Number(url.split('/').pop());
    const contacts = this.supabaseService.contacts();
    const found = contacts.find(c => c.id === id);
    if (found) {
      return found.contact_name;
    }
    if (contacts.length > 0) {
      return contacts[0].contact_name;
    }
    return '';
  });

  // true = Dropdown ist eingeflogen, false = Dropdown fliegt (wieder) raus
  isMenuOpen = signal(false);

  // true = Dropdown steht noch im DOM (bleibt beim Schließen so lange true, bis die Flug-raus-Animation fertig ist)
  isMenuVisible = signal(false);

  // Wird beim Klick auf den Profil-Button aufgerufen: macht das Dropdown auf/zu
  openOrCloseMenu(): void {
    if (this.isMenuOpen()) {
      this.closeMenu();
    } else {
      this.isMenuOpen.set(true);
      this.isMenuVisible.set(true);
    }
  }

  // Wird beim Klick daneben (Backdrop) oder auf "Log out" aufgerufen: startet die Flug-raus-Animation
  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  // Wird aufgerufen, sobald die transform-Animation im Dropdown fertig ist
  onDropdownTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName === 'transform' && !this.isMenuOpen()) {
      this.isMenuVisible.set(false);
    }
  }
}
