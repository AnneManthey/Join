import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject, provideAppInitializer } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AuthService } from './shared/services/auth-service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    /**
 * Registers an app initializer that blocks Angular's bootstrap process
 * until the initial Supabase auth state has been resolved.
 *
 * This ensures `AuthService.isLoggedIn` (and `currentUserId`) hold their
 * correct values *before* the router evaluates any guards, preventing a
 * false "not logged in" redirect on page reload while Supabase is still
 * restoring the session from local storage.
 *
 * `AuthService.initAuthListener()` registers the single `onAuthStateChange`
 * listener used for the entire app lifetime and resolves its returned
 * promise on the first emission (login, logout, or restored session).
 */
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.initAuthListener();
    })
  ],
};
