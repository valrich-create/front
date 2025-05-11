import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import {AuthService} from "./auth.service";


export const authGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Vérification des rôles si nécessaire
    const requiredRole = route.data['role'];
    if (requiredRole) {
      const user = authService.getUser();
      if (user && user.role === requiredRole) {
        return true;
      }
      // Rediriger vers une page d'accès refusé
      return router.createUrlTree(['/unauthorized']);
    }
    return true;
  }

  // Stocker l'URL de retour pour rediriger après la connexion
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
