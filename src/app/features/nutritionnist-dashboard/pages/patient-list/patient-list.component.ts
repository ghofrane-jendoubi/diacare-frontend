import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NutritionService } from '../../../../services/nutrition.service';
import { Patient } from '../../../../models/diet-plan.model';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css']
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  searchTerm: string = '';
  selectedDiabetesType: string = '';
  diabetesTypes: string[] = ['TYPE_1', 'TYPE_2', 'GESTATIONNEL'];
  isLoading: boolean = true;
  
  // ✅ Ajout de l'ID du nutritionniste connecté
  nutritionistId: number | null = null;
  nutritionistName: string = '';

  constructor(
    private nutritionService: NutritionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Charger les infos du nutritionniste connecté
    this.loadNutritionistInfo();
    this.loadPatients();
  }

  // ✅ Charger les informations du nutritionniste connecté
  loadNutritionistInfo(): void {
    const nutritionistIdStr = localStorage.getItem('nutritionist_id');
    const firstName = localStorage.getItem('nutritionist_firstName');
    const lastName = localStorage.getItem('nutritionist_lastName');
    
    if (nutritionistIdStr) {
      this.nutritionistId = parseInt(nutritionistIdStr);
      console.log('✅ Nutritionniste connecté ID:', this.nutritionistId);
      
      if (firstName && lastName) {
        this.nutritionistName = `${firstName} ${lastName}`;
      } else if (firstName) {
        this.nutritionistName = firstName;
      } else {
        this.nutritionistName = 'Nutritionniste';
      }
    } else {
      console.error('❌ Aucun nutritionniste connecté');
      // Rediriger vers login si nécessaire
      setTimeout(() => {
        this.router.navigate(['/auth/nutritionist']);
      }, 2000);
    }
  }

  loadPatients(): void {
    this.isLoading = true;
    
    // ✅ Appeler l'API avec l'ID du nutritionniste
    this.nutritionService.getPatientsByNutritionist(this.nutritionistId!).subscribe({
      next: (data) => {
        this.patients = data;
        this.filteredPatients = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading patients:', error);
        this.isLoading = false;
      }
    });
  }

  filterPatients(): void {
    this.filteredPatients = this.patients.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           patient.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDiabetesType = !this.selectedDiabetesType || 
                                  patient.diabetesType === this.selectedDiabetesType;
      return matchesSearch && matchesDiabetesType;
    });
  }

  viewPatient(patientId: number): void {
    this.router.navigate(['/nutritionnist/patient', patientId]);
  }

  createMealPlan(patientId: number): void {
    this.router.navigate(['/nutritionnist/plan-create'], {
      queryParams: { patientId: patientId }
    });
  }

  startChat(patientId: number): void {
    this.router.navigate(['/nutritionnist/chat', patientId]);
  }

  getActiveAlertsCount(): number {
    return this.patients.filter(p => p.status === 'warning').length;
  }

  getAvatarColor(diabetesType: string): string {
    const colors = {
      'TYPE_1': '#1976d2',
      'TYPE_2': '#388e3c',
      'GESTATIONNEL': '#c2185b',
      'GESTATIONAL': '#c2185b'
    };
    return colors[diabetesType as keyof typeof colors] || '#7f8c8d';
  }

  getBMIClass(bmi: number): string {
    return this.nutritionService.getBMIClass(bmi);
  }

  // ✅ Méthode pour rafraîchir la liste
  refreshPatients(): void {
    this.loadPatients();
  }
}