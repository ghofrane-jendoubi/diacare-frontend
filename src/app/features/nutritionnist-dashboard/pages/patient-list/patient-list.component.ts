import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NutritionService} from '../../../../services/nutrition.service';
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

  constructor(
    private nutritionistService: NutritionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.nutritionistService.getAllPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.filteredPatients = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
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
    this.router.navigate(['/nutritionist/patient', patientId]);
  }

  createMealPlan(patientId: number): void {
    this.router.navigate(['/nutritionist/plan-create', patientId]);
  }

  startChat(patientId: number): void {
    this.router.navigate(['/nutritionist/chat', patientId]);
  }

  getActiveAlertsCount(): number {
    return this.patients.filter(p => p.status === 'warning').length;
  }

  getAvatarColor(diabetesType: string): string {
    const colors = {
      'TYPE_1': '#1976d2',
      'TYPE_2': '#388e3c',
      'GESTATIONNEL': '#c2185b'
    };
    return colors[diabetesType as keyof typeof colors] || '#7f8c8d';
  }

  getBMIClass(bmi: number): string {
    return this.nutritionistService.getBMIClass(bmi);
  }
}