import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

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
    { id: 'forum', label: 'Forum', icon: 'bi bi-people', link: '/patient/forum' },
    { id: 'geolocation', label: 'Géolocalisation', icon: 'bi bi-geo-alt', link: '/geolocation' },
    { id: 'pharmacy', label: 'Parapharmacie', icon: 'bi bi-capsule-pill', link: '/pharmacy' },
    { id: 'chatbot', label: 'Chatbot', icon: 'bi bi-robot', link: '/chatbot' },
    { id: 'support', label: 'Support', icon: 'bi bi-exclamation-triangle', link: '/reclamations' }
  ];

  // Propriétés pour le header
  isScrolled = false;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  activeSection: string = '';

  // Données utilisateur (à remplacer avec AuthService)
  currentUser = {
    name: 'Sophie Martin',
    email: 'sophie.martin@example.com'
  };

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

  setActiveSection(sectionId: string) {
    this.activeSection = sectionId;
    this.isMobileMenuOpen = false;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  getUserInitial(): string {
    return this.currentUser.name ? this.currentUser.name.charAt(0).toUpperCase() : 'P';
  }

  getUserName(): string {
    return this.currentUser.name || 'Patient';
  }

  getUserEmail(): string {
    return this.currentUser.email || 'patient@example.com';
  }

  logout() {
    // Logique de déconnexion
    this.router.navigate(['/login']);
  }

  scrollToChatbot() {
    const chatbot = document.querySelector('.chat-fab') as HTMLElement;
    if (chatbot) chatbot.click();
  }

  constructor(private router: Router) {}
}