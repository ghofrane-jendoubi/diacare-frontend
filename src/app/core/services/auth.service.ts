import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface PatientUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;  // ✅ AJOUT : rôle de l'utilisateur (PATIENT, DOCTOR, NUTRITIONNIST, ADMIN)
  profilePicture?: string;
  diabetesType?: string;
  bloodType?: string;
  // ✅ AJOUT : champs pour les autres types d'utilisateurs
  specialty?: string;  // Pour les médecins
  phone?: string;
  address?: string;
  city?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<PatientUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadUserFromStorage();
  }

  // ✅ SAFE localStorage
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private loadUserFromStorage(): void {
    if (this.isBrowser()) {
      const user = localStorage.getItem('user');
      if (user) {
        this.currentUserSubject.next(JSON.parse(user));
      }
    }
  }

  setCurrentUser(user: PatientUser): void {
    this.currentUserSubject.next(user);
    if (this.isBrowser()) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getCurrentUser(): PatientUser | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem('token');
    }
    return null;
  }

  setToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem('token', token);
    }
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
  }

  getInitials(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    return (user.firstName[0] + user.lastName[0]).toUpperCase();
  }

  updateProfilePicture(path: string): void {
    const user = this.getCurrentUser();
    if (!user) return;
    const updated = { ...user, profilePicture: path };
    this.setCurrentUser(updated);
  }



  /**
   * Vérifie si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null && this.getToken() !== null;
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Vérifie si l'utilisateur est un patient
   */
  isPatient(): boolean {
    return this.hasRole('PATIENT');
  }

  /**
   * Vérifie si l'utilisateur est un médecin
   */
  isDoctor(): boolean {
    return this.hasRole('DOCTOR');
  }

  /**
   * Vérifie si l'utilisateur est un nutritionniste
   */
  isNutritionnist(): boolean {
    return this.hasRole('NUTRITIONIST');
  }

  /**
   * Vérifie si l'utilisateur est un admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Retourne l'ID de l'utilisateur connecté
   */
  getUserId(): number {
    const user = this.getCurrentUser();
    return user?.id || 0;
  }

  /**
   * Retourne le nom complet de l'utilisateur
   */
  getFullName(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`.trim();
  }

  /**
   * Retourne le nom complet avec titre selon le rôle
   */
  getDisplayName(): string {
    const user = this.getCurrentUser();
    if (!user) return 'Invité';
    
    if (user.role === 'DOCTOR') {
      return `Dr. ${user.firstName} ${user.lastName}`;
    }
    return `${user.firstName} ${user.lastName}`;
  }

  /**
   * Retourne la couleur associée au rôle
   */
  getRoleColor(): string {
    const role = this.getCurrentUser()?.role;
    switch (role) {
      case 'PATIENT': return '#3b82f6';
      case 'DOCTOR': return '#10b981';
      case 'NUTRITIONIST': return '#f59e0b';
      case 'ADMIN': return '#8b5cf6';
      default: return '#64748b';
    }
  }

  /**
   * Retourne l'icône associée au rôle
   */
  getRoleIcon(): string {
    const role = this.getCurrentUser()?.role;
    switch (role) {
      case 'PATIENT': return 'bi-person';
      case 'DOCTOR': return 'bi-person-badge';
      case 'NUTRITIONIST': return 'bi-apple';
      case 'ADMIN': return 'bi-shield';
      default: return 'bi-person-circle';
    }
  }

  /**
   * Met à jour uniquement certaines propriétés de l'utilisateur
   */
  updateUser(updates: Partial<PatientUser>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.setCurrentUser(updatedUser);
    }
  }
}