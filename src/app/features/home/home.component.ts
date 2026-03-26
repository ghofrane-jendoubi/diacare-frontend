import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isMobileMenuOpen = false;
  isScrolled = false;
  heroImage = '/hero-diacare.png';

  constructor(private router: Router, public auth: AuthService) {}

  @HostListener('window:scroll', [])
  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  goToEducation() {
    if (this.auth.isLoggedIn && this.auth.isPatient) {
      this.router.navigate(['/patient/education']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goCommunity() {
    if (this.auth.isLoggedIn) {
      this.router.navigate(['/patient/forum']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goIA() {
    if (this.auth.isLoggedIn && this.auth.isPatient) {
      this.router.navigate(['/patient/ia-dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}