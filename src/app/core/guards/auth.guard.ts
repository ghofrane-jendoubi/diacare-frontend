import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean {
    // Vérifie si on est dans le navigateur (pas SSR)
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        return true;
      }
    } else {
      // Côté serveur SSR → autoriser l'accès
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}