import { Component } from '@angular/core';

@Component({
  selector: 'app-patient-home',
  templateUrl: './patient-home.component.html',
  styleUrls: ['./patient-home.component.css']
})
export class PatientHomeComponent {

  heroImage = '/hero-diacare.png';

  patientMenuItems = [
    { id: 'medecins', label: 'Médecins', icon: 'bi bi-camera-video', link: '/medecins' },
    { id: 'nutrition', label: 'Nutrition', icon: 'bi bi-egg-fried', link: '/nutrition' },
    { id: 'education', label: 'Éducation', icon: 'bi bi-book', link: '/patient/education' },
    { id: 'geolocation', label: 'Géolocalisation', icon: 'bi bi-geo-alt', link: '/geolocation' },
    { id: 'pharmacy', label: 'Parapharmacie', icon: 'bi bi-capsule-pill', link: '/pharmacy' },
    { id: 'chatbot', label: 'Chatbot', icon: 'bi bi-robot', link: '/chatbot' },
    { id: 'reclamations', label: 'Support', icon: 'bi bi-exclamation-triangle', link: '/reclamations' }
  ];

  scrollToChatbot() {
    const chatbot = document.querySelector('.chat-fab') as HTMLElement;
    if (chatbot) chatbot.click();
  }
}