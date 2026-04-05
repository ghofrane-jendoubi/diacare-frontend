import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isAuthPage = false;
  showUserMenu = false;
  showMobileMenu = false;

  constructor(public auth: AuthService, private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isAuthPage = ['/login', '/register', '/doctor/education', '/doctor/education/new', '/doctor/education/comments', '/patient/education'].includes(e.urlAfterRedirects);
      this.showUserMenu = false;
      this.showMobileMenu = false;
    });
  }

  get currentUserFirstName(): string {
    return this.auth.currentUser?.name?.split(' ')[0] ?? '';
  }

  get currentUserLastName(): string {
    const name = this.auth.currentUser?.name;
    return name ? name.split(' ').slice(-1)[0] : '';
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  logout() {
    this.auth.logout();
    this.showUserMenu = false;
    this.showMobileMenu = false;
  }
}
