import { Component } from '@angular/core';

@Component({
  selector: 'app-patient-layout',
  templateUrl: './patient-layout.component.html',
  styleUrls: ['./patient-layout.component.css']
})
export class PatientLayoutComponent {
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

  // ⚡ Propriété manquante pour le template
  showNutritionTabs = true; // ou false selon ton besoin
}