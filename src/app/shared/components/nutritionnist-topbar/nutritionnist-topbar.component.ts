import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-nutritionnist-topbar',
  templateUrl: './nutritionnist-topbar.component.html',
  styleUrls: ['./nutritionnist-topbar.component.css']
})
export class NutritionnistTopbarComponent implements OnInit {
  nutritionistName: string = 'Dr. Sophie Martin';
  nutritionistInitials: string = 'SM';
  unreadNotificationsCount: number = 0;
  searchQuery: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNutritionistInfo();
    this.loadNotificationsCount();
  }

  loadNutritionistInfo(): void {
    // Récupérer depuis AuthService
    const user = this.authService.getCurrentUser();
    
    if (user && (user.role === 'NUTRITIONIST' || user.role === 'NUTRITIONNIST')) {
      this.nutritionistName = `Dr. ${user.firstName} ${user.lastName}`;
      this.nutritionistInitials = (user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '');
    } else {
      // Fallback vers localStorage
      const firstName = localStorage.getItem('nutritionist_firstName');
      const lastName = localStorage.getItem('nutritionist_lastName');
      
      if (firstName && lastName) {
        this.nutritionistName = `Dr. ${firstName} ${lastName}`;
        this.nutritionistInitials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
      }
    }
    
    console.log('Nutritionniste chargé:', this.nutritionistName);
  }

  loadNotificationsCount(): void {
    // Récupérer le nombre de notifications non lues
    // À implémenter avec un service de notifications
    this.unreadNotificationsCount = 3; // Valeur temporaire
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Recherche:', this.searchQuery);
      // Implémenter la recherche
      this.router.navigate(['/nutritionnist/patients'], { 
        queryParams: { search: this.searchQuery }
      });
    }
  }

  logout(): void {
    // Nettoyer localStorage
    localStorage.removeItem('nutritionist_id');
    localStorage.removeItem('nutritionist_email');
    localStorage.removeItem('nutritionist_firstName');
    localStorage.removeItem('nutritionist_lastName');
    localStorage.removeItem('nutritionist_role');
    localStorage.removeItem('token');
    
    this.router.navigate(['/auth/nutritionist']);
  }

  goToProfile(): void {
    this.router.navigate(['/nutritionnist/profile']);
  }

  goToSettings(): void {
    this.router.navigate(['/nutritionnist/settings']);
  }

  toggleSidebar(): void {
    // Émettre un événement pour toggle la sidebar
    const event = new CustomEvent('toggleSidebar');
    window.dispatchEvent(event);
  }
}