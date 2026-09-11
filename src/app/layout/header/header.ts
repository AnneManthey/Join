import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth-service';
import { GetInitialsPipe } from '../../shared/pipes/get-initials-pipe';

const ROUTES_WITHOUT_HELP_BUTTON = ['/support', '/legal-notice', '/privacy-policy'];

@Component({
  selector: 'app-header',
  imports: [RouterLink, GetInitialsPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})

export class Header {
  authService = inject(AuthService);
  private router = inject(Router);

  /** Current URL, updated on every navigation. */
  currentUrl = signal(this.router.url);

    /** True when the dropdown has transitioned in, false when it is transitioning out. */
  isMenuOpen = signal(false);

  isMenuVisible = signal(false);

  /** True unless the current route is one of the pages where the help button should be hidden. */
  showHelpButton = computed(() =>
    !ROUTES_WITHOUT_HELP_BUTTON.some((route) => this.currentUrl().startsWith(route))
  );

  /**
   * Initials shown in the profile button: 'G' for a guest login,
   * otherwise the initials of the logged-in user's display name.
   */
  profileInitials = computed(() => {
    if (this.authService.isGuest()) {
      return 'G';
    }
    return this.authService.currentUserName();
  });

  /**
   * Subscribes to router navigation events and keeps `currentUrl` in sync
   * so that computed properties like `showHelpButton` react to route changes.
   */
  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects);
      }
    });
  }

  /** Profile button click handler: opens or closes the dropdown. */
  openOrCloseMenu(): void {
    if (this.isMenuOpen()) {
      this.closeMenu();
    } else {
      this.isMenuOpen.set(true);
      this.isMenuVisible.set(true);
    }
  }

  /** Starts closing the dropdown by triggering its transition-out animation. */
  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  /**
   * Hides the dropdown from the DOM once its closing transition has finished,
   * preventing it from being visible/interactable while not open.
   *
   * @param event - The transition event fired by the dropdown element.
   */
  onDropdownTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName === 'transform' && !this.isMenuOpen()) {
      this.isMenuVisible.set(false);
    }
  }
}
