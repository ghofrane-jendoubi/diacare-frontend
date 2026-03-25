import { Component, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() menuItems: any[] = [];
  @Input() isLoggedIn: boolean = false;
   @Input() userId!: number;
  
  isScrolled = false;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;

  activeSection: string = '';

  @HostListener('window:scroll', [])
  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  scrollTo(sectionId: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.activeSection = sectionId;
      this.isMobileMenuOpen = false;
    }
  }

  logout() {
    // Logique de déconnexion
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }

  constructor(private router: Router) {}
}