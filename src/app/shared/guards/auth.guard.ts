// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Vérifier si l'utilisateur est connecté
    const isLoggedIn = this.auth.getCurrentUser() !== null && this.auth.getToken() !== null;
    
    if (isLoggedIn) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}