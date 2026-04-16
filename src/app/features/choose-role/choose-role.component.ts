import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-choose-role',
  templateUrl: './choose-role.component.html',
  styleUrls: ['./choose-role.component.css']
})
export class ChooseRoleComponent {

  roles = [
    {
      name: 'Doctor',
      route: 'doctor',
      icon: 'bi bi-heart-pulse-fill',
      description: 'Soins experts pour vos patients',
      indicatorIcon: 'bi bi-hospital',
      indicatorText: 'Espace médical',
      new: false,
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
    },
    {
      name: 'Nutritionist',
      route: 'nutritionist',
      icon: 'bi bi-apple',
      description: 'Bien-être et conseils nutritifs',
      indicatorIcon: 'bi bi-flower1',
      indicatorText: 'Espace nutrition',
      new: true,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      name: 'Patient',
      route: 'patient',
      icon: 'bi bi-person-fill',
      description: 'Suivi personnalisé de votre santé',
      indicatorIcon: 'bi bi-graph-up',
      indicatorText: 'Mon espace santé',
      new: false,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ];

  constructor(private router: Router) {}

  selectRole(role: string): void {
    // Animation de clic
    const cards = document.querySelectorAll('.role-card');
    cards.forEach(card => {
      card.classList.add('click-animation');
      setTimeout(() => {
        card.classList.remove('click-animation');
      }, 300);
    });
    
    // Redirection avec délai pour l'animation
    setTimeout(() => {
      this.router.navigate(['/auth', role]);
    }, 200);
  }
}