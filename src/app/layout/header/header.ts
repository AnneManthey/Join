
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

  // true = dropdown transitioned in, false = dropdown transitions out
  isMenuOpen = signal(false);

  isMenuVisible = signal(false);

  // Profile button click handler: opens/closes the dropdown
  openOrCloseMenu(): void {
    if (this.isMenuOpen()) {
      this.closeMenu();
    } else {
      this.isMenuOpen.set(true);
      this.isMenuVisible.set(true);
    }
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  onDropdownTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName === 'transform' && !this.isMenuOpen()) {
      this.isMenuVisible.set(false);
    }
  }
}
