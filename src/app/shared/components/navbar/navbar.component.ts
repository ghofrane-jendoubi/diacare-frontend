// app/shared/navbar/navbar.component.ts
import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, PatientUser } from '../../../core/services/auth.service';

export interface MenuItem {
  id: string;
  label: string;
  link: string;
  icon?: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() menuItems: MenuItem[] = [];
  @Input() isLoggedIn: boolean = false;

  currentUser: PatientUser | null = null;
  isScrolled = false;
  isUserMenuOpen = false;
  isMobileMenuOpen = false;
  activeSection = '';

  private userSub!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // S'abonner au user courant — mise à jour automatique
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  get displayName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  get initials(): string {
    return this.authService.getInitials();
  }

  get profilePictureUrl(): string | null {
    return this.currentUser?.profilePicture
      ? `http://localhost:8081${this.currentUser.profilePicture}`
      : null;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  scrollTo(id: string, event: Event): void {
    event.preventDefault();
    this.activeSection = id;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}