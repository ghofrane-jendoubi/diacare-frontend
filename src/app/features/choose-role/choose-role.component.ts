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
      name: 'Admin',
      icon: 'bi bi-shield-lock-fill',
      description: 'Contrôle total',
      indicatorIcon: 'bi bi-crown',
      indicatorText: 'Super powers',
      new: false,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      name: 'Doctor',
      icon: 'bi bi-heart-pulse-fill',
      description: 'Soins experts',
      indicatorIcon: 'bi bi-hospital',
      indicatorText: 'Medical care',
      new: false,
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
    },
    {
      name: 'Nutritionist',
      icon: 'bi bi-apple',
      description: 'Bien-être nutritif',
      indicatorIcon: 'bi bi-flower1',
      indicatorText: 'Healthy life',
      new: true,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      name: 'Patient',
      icon: 'bi bi-person-fill',
      description: 'Suivi personnel',
      indicatorIcon: 'bi bi-graph-up',
      indicatorText: 'My health',
      new: false,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ];

  constructor(private router: Router) {}

  selectRole(role: string): void {
    const cards = document.querySelectorAll('.role-card');
    cards.forEach(card => {
      card.classList.add('click-animation');
    });
    
    setTimeout(() => {
      this.router.navigate(['/auth', role]);
    }, 200);
  }
}