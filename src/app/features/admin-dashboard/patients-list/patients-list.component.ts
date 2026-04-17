import { Component, OnInit } from '@angular/core';
import { AdminDataService } from '../../../core/services/admin-data.service';

@Component({
  selector: 'app-patients-list',
  templateUrl: './patients-list.component.html',
  styleUrls: ['./patients-list.component.css']
})
export class PatientsListComponent implements OnInit {

  patients: any[] = [];
  filteredPatients: any[] = [];
  isLoading = false;
  searchTerm = '';
  showModal = false;
  selectedPatient: any = null;

  constructor(private dataService: AdminDataService) {}

  ngOnInit(): void { 
    this.loadPatients(); 
  }

  loadPatients(): void {
    this.isLoading = true;
    this.dataService.getAllPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.filteredPatients = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement patients:', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredPatients = this.patients.filter(p =>
      p.firstName?.toLowerCase().includes(term) ||
      p.lastName?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.city?.toLowerCase().includes(term) ||
      p.diabetesType?.toLowerCase().includes(term)
    );
  }

  openModal(p: any): void { 
    this.selectedPatient = { ...p }; 
    this.showModal = true; 
  }
  
  closeModal(): void { 
    this.showModal = false; 
    this.selectedPatient = null; 
  }

  getBloodTypeLabel(bt: string): string {
    const map: any = {
      A_POSITIVE: 'A+', A_NEGATIVE: 'A-', 
      B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
      AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-', 
      O_POSITIVE: 'O+', O_NEGATIVE: 'O-'
    };
    return map[bt] || bt || '—';
  }

  getDiabetesLabel(dt: string): string {
    const map: any = {
      TYPE_1: 'Type 1', 
      TYPE_2: 'Type 2', 
      GESTATIONAL: 'Gestationnel',
      PREDIABETES: 'Pré-diabète', 
      OTHER: 'Autre'
    };
    return map[dt] || dt || '—';
  }

  getActiveCount(): number {
    return this.patients.filter(p => p.enabled).length;
  }
}