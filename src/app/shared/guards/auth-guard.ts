import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';


export const authGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (authService.isLoggedIn()) return true;
    return router.createUrlTree(['']);
};