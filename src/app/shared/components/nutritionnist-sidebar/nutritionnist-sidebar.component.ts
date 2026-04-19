import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChatNutritionService } from '../../../services/chatnutrition.service';

@Component({
  selector: 'app-nutritionnist-sidebar',
  templateUrl: './nutritionnist-sidebar.component.html',
  styleUrls: ['./nutritionnist-sidebar.component.css']
})
export class NutritionnistSidebarComponent implements OnInit {
  @Input() isCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<boolean>();

  nutritionistId: number = 0;
  nutritionistName: string = '';
  patientsCount: number = 0;
  reclamationsCount: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private chatService: ChatNutritionService
  ) {}

  ngOnInit(): void {
    this.loadNutritionistInfo();
    this.loadCounters();
  }

  loadNutritionistInfo(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.role === 'NUTRITIONIST') {
      this.nutritionistId = user.id;
      this.nutritionistName = `${user.firstName} ${user.lastName}`;
    } else {
      const idStr = localStorage.getItem('nutritionist_id');
      const firstName = localStorage.getItem('nutritionist_firstName');
      const lastName = localStorage.getItem('nutritionist_lastName');
      if (idStr) this.nutritionistId = parseInt(idStr);
      if (firstName && lastName) this.nutritionistName = `${firstName} ${lastName}`;
    }
  }

  loadCounters(): void {
    if (!this.nutritionistId) return;
    
    // Charger le nombre de patients
    this.chatService.getNutritionistPatients(this.nutritionistId).subscribe({
      next: (patients) => this.patientsCount = patients.length,
      error: () => this.patientsCount = 0
    });
  }

  onToggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.toggleSidebar.emit(this.isCollapsed);
    
    if (this.isCollapsed) {
      document.body.classList.add('sidebar-nutri-collapsed');
    } else {
      document.body.classList.remove('sidebar-nutri-collapsed');
    }
  }

  logout(): void {
    localStorage.removeItem('nutritionist_id');
    localStorage.removeItem('nutritionist_email');
    localStorage.removeItem('nutritionist_firstName');
    localStorage.removeItem('nutritionist_lastName');
    localStorage.removeItem('nutritionist_role');
    localStorage.removeItem('token');
    this.router.navigate(['/auth/nutritionist']);
  }
}