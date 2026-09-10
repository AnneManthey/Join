import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';


/** Allows navigation only when the user has an active authentication session. */
export const authGuard: CanActivateFn = (
    /** Route requested by the user. */
    route: ActivatedRouteSnapshot,
    /** Router state associated with the requested route. */
    state: RouterStateSnapshot,
) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (authService.isLoggedIn()) return true;
    return router.createUrlTree(['']);
};

/** Redirects authenticated users away from the login start page. */
export const redirectAuthenticatedGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) return router.createUrlTree(['/summary']);
    return true;
};