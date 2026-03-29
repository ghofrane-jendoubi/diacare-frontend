import { Component, OnInit } from '@angular/core';
import { AdminDataService } from '../services/admin-data.service';

@Component({
  selector: 'app-doctors-list',
  templateUrl: './doctors-list.component.html',
  styleUrls: ['./doctors-list.component.css']
})
export class DoctorsListComponent implements OnInit {

  doctors: any[] = [];
  filteredDoctors: any[] = [];
  isLoading = false;
  searchTerm = '';
  statusFilter = 'ALL';
  successMessage = '';
  errorMessage = '';
  actionLoading = false;

  showModal = false;
  selectedDoctor: any = null;
  imageBaseUrl = 'http://localhost:8081/';

  constructor(private dataService: AdminDataService) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.dataService.getAllDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement médecins:', err);
        this.isLoading = false;
        this.errorMessage = 'Erreur lors du chargement des médecins';
      }
    });
  }

  applyFilters(): void {
    let result = [...this.doctors];

    if (this.statusFilter !== 'ALL') {
      result = result.filter(d => d.certificateStatus === this.statusFilter);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(d =>
        d.firstName?.toLowerCase().includes(term) ||
        d.lastName?.toLowerCase().includes(term) ||
        d.email?.toLowerCase().includes(term) ||
        d.speciality?.toLowerCase().includes(term) ||
        d.hospital?.toLowerCase().includes(term)
      );
    }

    this.filteredDoctors = result;
  }

  onSearch(): void { this.applyFilters(); }
  
  onFilterChange(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  countByStatus(status: string): number {
    return this.doctors.filter(d => d.certificateStatus === status).length;
  }

  openModal(doctor: any): void {
    this.selectedDoctor = { ...doctor };
    this.showModal = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedDoctor = null;
  }

  approve(doctor: any): void {
    this.actionLoading = true;
    this.dataService.approveDoctor(doctor.id).subscribe({
      next: () => {
        this.actionLoading = false;
        const idx = this.doctors.findIndex(d => d.id === doctor.id);
        if (idx !== -1) this.doctors[idx].certificateStatus = 'APPROVED';
        if (this.selectedDoctor?.id === doctor.id)
          this.selectedDoctor.certificateStatus = 'APPROVED';
        this.applyFilters();
        this.successMessage = `Dr. ${doctor.firstName} ${doctor.lastName} approuvé(e) avec succès.`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.actionLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l\'approbation.';
      }
    });
  }

  reject(doctor: any): void {
    this.actionLoading = true;
    this.dataService.rejectDoctor(doctor.id).subscribe({
      next: () => {
        this.actionLoading = false;
        const idx = this.doctors.findIndex(d => d.id === doctor.id);
        if (idx !== -1) this.doctors[idx].certificateStatus = 'REJECTED';
        if (this.selectedDoctor?.id === doctor.id)
          this.selectedDoctor.certificateStatus = 'REJECTED';
        this.applyFilters();
        this.successMessage = `Dr. ${doctor.firstName} ${doctor.lastName} rejeté(e).`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.actionLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors du rejet.';
      }
    });
  }

  getStatusClass(status: string): string {
    const map: any = { 
      PENDING: 'badge-pending', 
      APPROVED: 'badge-approved', 
      REJECTED: 'badge-rejected' 
    };
    return map[status] || '';
  }

  getStatusLabel(status: string): string {
    const map: any = { 
      PENDING: 'En attente', 
      APPROVED: 'Approuvé', 
      REJECTED: 'Rejeté' 
    };
    return map[status] || status;
  }

  getCertUrl(path: string): string {
    return this.imageBaseUrl + path;
  }
}