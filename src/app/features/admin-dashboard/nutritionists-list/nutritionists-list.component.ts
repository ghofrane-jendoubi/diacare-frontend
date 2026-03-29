import { Component, OnInit } from '@angular/core';
import { AdminDataService } from '../services/admin-data.service';

@Component({
  selector: 'app-nutritionists-list',
  templateUrl: './nutritionists-list.component.html',
  styleUrls: ['./nutritionists-list.component.css']
})
export class NutritionistsListComponent implements OnInit {

  nutritionists: any[] = [];
  filteredNutritionists: any[] = [];
  isLoading = false;
  searchTerm = '';
  statusFilter = 'ALL';
  successMessage = '';
  errorMessage = '';
  actionLoading = false;
  showModal = false;
  selectedNutritionist: any = null;
  imageBaseUrl = 'http://localhost:8081/';

  constructor(private dataService: AdminDataService) {}

  ngOnInit(): void { 
    this.loadNutritionists(); 
  }

  loadNutritionists(): void {
    this.isLoading = true;
    this.dataService.getAllNutritionists().subscribe({
      next: (data) => {
        this.nutritionists = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement nutritionnistes:', err);
        this.isLoading = false;
        this.errorMessage = 'Erreur lors du chargement des nutritionnistes';
      }
    });
  }

  applyFilters(): void {
    let result = [...this.nutritionists];
    
    if (this.statusFilter !== 'ALL') {
      result = result.filter(n => n.certificateStatus === this.statusFilter);
    }
    
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(n =>
        n.firstName?.toLowerCase().includes(term) ||
        n.lastName?.toLowerCase().includes(term) ||
        n.email?.toLowerCase().includes(term) ||
        n.workplace?.toLowerCase().includes(term) ||
        n.licenseNumber?.toLowerCase().includes(term)
      );
    }
    
    this.filteredNutritionists = result;
  }

  onSearch(): void { this.applyFilters(); }
  
  onFilterChange(s: string): void { 
    this.statusFilter = s; 
    this.applyFilters(); 
  }
  
  countByStatus(s: string): number { 
    return this.nutritionists.filter(n => n.certificateStatus === s).length; 
  }

  openModal(n: any): void { 
    this.selectedNutritionist = { ...n }; 
    this.showModal = true; 
  }
  
  closeModal(): void { 
    this.showModal = false; 
    this.selectedNutritionist = null; 
  }

  approve(n: any): void {
    this.actionLoading = true;
    this.dataService.approveNutritionist(n.id).subscribe({
      next: () => {
        this.actionLoading = false;
        const idx = this.nutritionists.findIndex(x => x.id === n.id);
        if (idx !== -1) this.nutritionists[idx].certificateStatus = 'APPROVED';
        if (this.selectedNutritionist?.id === n.id) 
          this.selectedNutritionist.certificateStatus = 'APPROVED';
        this.applyFilters();
        this.successMessage = `${n.firstName} ${n.lastName} approuvé(e).`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => { 
        this.actionLoading = false; 
        this.errorMessage = err.error?.message || 'Erreur lors de l\'approbation.'; 
      }
    });
  }

  reject(n: any): void {
    this.actionLoading = true;
    this.dataService.rejectNutritionist(n.id).subscribe({
      next: () => {
        this.actionLoading = false;
        const idx = this.nutritionists.findIndex(x => x.id === n.id);
        if (idx !== -1) this.nutritionists[idx].certificateStatus = 'REJECTED';
        if (this.selectedNutritionist?.id === n.id) 
          this.selectedNutritionist.certificateStatus = 'REJECTED';
        this.applyFilters();
        this.successMessage = `${n.firstName} ${n.lastName} rejeté(e).`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => { 
        this.actionLoading = false; 
        this.errorMessage = err.error?.message || 'Erreur lors du rejet.'; 
      }
    });
  }

  getStatusClass(s: string): string {
    const map: any = { 
      PENDING: 'badge-pending', 
      APPROVED: 'badge-approved', 
      REJECTED: 'badge-rejected' 
    };
    return map[s] || '';
  }
  
  getStatusLabel(s: string): string {
    const map: any = { 
      PENDING: 'En attente', 
      APPROVED: 'Approuvé', 
      REJECTED: 'Rejeté' 
    };
    return map[s] || s;
  }
  
  getCertUrl(path: string): string { 
    return this.imageBaseUrl + path; 
  }
}