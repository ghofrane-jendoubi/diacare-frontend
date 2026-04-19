// patient-nutritionists.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatNutritionService, Nutritionist } from '../../../../services/chatnutrition.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-patient-nutritionists',
  templateUrl: './patient-nutritionists.component.html',
  styleUrls: ['./patient-nutritionists.component.css']
})
export class PatientNutritionistsComponent implements OnInit {
  nutritionists: Nutritionist[] = [];
  isLoading = true;
  errorMessage = '';
  patientId: number | null = null;

  constructor(
    private chatService: ChatNutritionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatientId();
    this.loadNutritionists();
  }

  loadPatientId(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.patientId = user.id;
    }
  }

  loadNutritionists(): void {
    this.isLoading = true;
    this.chatService.getNutritionists().subscribe({
      next: (data) => {
        this.nutritionists = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement nutritionnistes:', err);
        this.errorMessage = 'Impossible de charger la liste des nutritionnistes';
        this.isLoading = false;
      }
    });
  }

  // ✅ Stocker l'ID du nutritionniste choisi pour toute la session
  startChat(nutritionist: Nutritionist): void {
    if (this.patientId) {
      localStorage.setItem('selected_nutritionist_id', nutritionist.id.toString());
      localStorage.setItem('selected_nutritionist_name', `${nutritionist.firstName} ${nutritionist.lastName}`);
      this.router.navigate(['/patient/nutrition-chat', nutritionist.id]);
    }
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName?.charAt(0) || '') + (lastName?.charAt(0) || '');
  }
}