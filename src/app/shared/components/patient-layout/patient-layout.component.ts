import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-patient-layout',
  templateUrl: './patient-layout.component.html',
  styleUrls: ['./patient-layout.component.css']
})
export class PatientLayoutComponent implements OnInit {
  patientMenuItems = [
    { id: 'analyse',      label: 'Analyse',        link: '/patient/choices' },
    { id: 'nutrition',    label: 'Nutrition',        link: '/patient/nutrition' },
    { id: 'education',    label: 'Éducation',        link: '/patient/education' },
    { id: 'messagerie',   label: 'Messagerie',       link: '/patient/chat' },
    { id: 'pharmacy',     label: 'Parapharmacie',    link: '/patient/pharmacy' },
    { id: 'chatbot',      label: 'Chatbot',          link: '/patient/chatbot' },
    { id: 'reclamations', label: 'Support',          link: '/patient/reclamations' }
  ];

  patientId: number | null = null;
  userName: string = '';
  userEmail: string = '';
  showNutritionTabs = false;

  // Routes où la sidebar nutrition doit s'afficher
  private nutritionRoutes = [
    '/patient/nutrition',
    '/patient/my-plans',
    '/patient/profile',
    '/patient/progress',
    '/patient/nutrition-chat'
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadPatientInfo();
    
    // Vérifier la route actuelle pour afficher/masquer la sidebar
    this.checkRoute(this.router.url);
    
    // Écouter les changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkRoute(event.url);
    });
  }

  checkRoute(url: string): void {
    this.showNutritionTabs = this.nutritionRoutes.some(route => url.includes(route));
  }

  loadPatientInfo(): void {
    const patientIdStr = localStorage.getItem('patient_id');
    if (patientIdStr) this.patientId = parseInt(patientIdStr);

    const firstName = localStorage.getItem('patient_firstName');
    const lastName  = localStorage.getItem('patient_lastName');
    this.userName = firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName || 'Patient';

    const email = localStorage.getItem('patient_email');
    if (email) this.userEmail = email;
  }
}