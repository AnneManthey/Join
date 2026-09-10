
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth-service';
import { GetInitialsPipe } from '../../shared/pipes/get-initials-pipe';
@Component({
  selector: 'app-header',
  imports: [RouterLink, GetInitialsPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(AuthService);

  // Initials shown in the profile button: 'G' for a guest login,
  // otherwise the initials of the logged-in user's display name.
  profileInitials = computed(() => {
    if (this.authService.isGuest()) {
      return 'G';
    }
    return this.authService.currentUserName();
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
