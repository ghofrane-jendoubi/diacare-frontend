import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-patient-layout',
  templateUrl: './patient-layout.component.html',
  styleUrls: ['./patient-layout.component.css']
})
export class PatientLayoutComponent {
   // ← déjà dans ton HTML : *ngIf="showNutritionTabs"
  showNutritionTabs = false;

  private nutritionRoutes = [
    '/patient/nutrition',
    '/patient/my-plans',
    '/patient/profile',
    '/patient/chat'
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Vérifier au chargement initial
    this.checkRoute(this.router.url);

    // Vérifier à chaque navigation
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.checkRoute(e.urlAfterRedirects);
    });
  }

  private checkRoute(url: string): void {
    this.showNutritionTabs = this.nutritionRoutes
      .some(route => url.startsWith(route));
  }


  // Menu patient
  patientMenuItems = [
    { id: 'doctors', label: 'Médecins', icon: 'bi bi-person-badge', link: '/patient/doctors' },
    { id: 'nutrition', label: 'Nutrition', icon: 'bi bi-egg-fried', link: '/patient/nutrition' },
    { id: 'education', label: 'Éducation', icon: 'bi bi-book', link: '/patient/education' },
    { id: 'geolocation', label: 'Géolocalisation', icon: 'bi bi-geo-alt', link: '/patient/geolocation' },
    { id: 'pharmacy', label: 'Parapharmacie', icon: 'bi bi-capsule-pill', link: '/patient/pharmacy' },
    { id: 'chatbot', label: 'Chatbot', icon: 'bi bi-robot', link: '/patient/chatbot' },
    { id: 'reclamations', label: 'Support', icon: 'bi bi-exclamation-triangle', link: '/patient/reclamations' }
  ];

}
