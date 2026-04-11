// patient-sidebar.component.ts (amélioré)
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService, PatientUser } from '../../core/services/auth.service';

@Component({
  selector: 'app-patient-sidebar',
  templateUrl: './patient-sidebar.component.html',
  styleUrls: ['./patient-sidebar.component.css']
})
export class PatientSidebarComponent implements OnInit {
  currentUser: PatientUser | null = null;
  currentRoute = '';

  menuItems = [
    { id: 'profile',       label: 'Mon profil',        icon: 'bi-person-fill',         route: '/patient/profile' },
    { id: 'appointments',  label: 'Mes rendez-vous',   icon: 'bi-calendar-check-fill', route: '/patient/appointments' },
    { id: 'analyses',      label: 'Mes analyses',      icon: 'bi-clipboard2-pulse',    route: '/patient/analyses' },
    { id: 'prescriptions', label: 'Mes ordonnances',   icon: 'bi-capsule-pill',        route: '/patient/prescriptions' },
    { id: 'orders',        label: 'Mes commandes',     icon: 'bi-box-seam',            route: '/patient/orders' },
    { id: 'reclamations',  label: 'Mes réclamations',  icon: 'bi-chat-left-text',      route: '/patient/reclamations' },
    { id: 'settings',      label: 'Paramètres',        icon: 'bi-gear-fill',           route: '/patient/settings' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
    });
  }

  get initials(): string {
    if (!this.currentUser) return 'U';
    return `${this.currentUser.firstName?.charAt(0) || ''}${this.currentUser.lastName?.charAt(0) || ''}`;
  }

  get profilePicUrl(): string | null {
    return this.currentUser?.profilePicture 
      ? `http://localhost:8081${this.currentUser.profilePicture}`
      : null;
  }

  isActive(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route + '/');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/choose-role']);
  }
}