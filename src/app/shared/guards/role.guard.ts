// role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'] as string;
    const userRole = this.auth.getCurrentUser()?.role;
    
    console.log('RoleGuard - Rôle requis:', requiredRole);
    console.log('RoleGuard - Rôle utilisateur:', userRole);
    
    if (userRole === requiredRole) {
      return true;
    }
    
    // Rediriger selon le rôle de l'utilisateur
    if (userRole === 'PATIENT') {
      this.router.navigate(['/patient/dashboard']);
    } else if (userRole === 'DOCTOR') {
      this.router.navigate(['/doctor/dashboard']);
    } else if (userRole === 'NUTRITIONIST') {
      this.router.navigate(['/nutritionnist/dashboard']);
    } else if (userRole === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
    
    return false;
  }
}