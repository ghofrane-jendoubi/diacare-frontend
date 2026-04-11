import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface PatientUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  diabetesType?: string;
  bloodType?: string;
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
}