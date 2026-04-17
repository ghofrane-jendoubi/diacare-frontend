import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  userType: string = '';
  users: any[] = [];
  filteredUsers: any[] = [];
  isLoading = false;
  searchTerm = '';
  statusFilter = 'ALL';
  successMessage = '';
  errorMessage = '';
  actionLoading = false;

  showModal = false;
  selectedUser: any = null;

  imageBaseUrl = 'http://localhost:8081/';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userType = params['type'];
      this.statusFilter = 'ALL';
      this.searchTerm = '';
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    let url = '';

    if (this.userType === 'doctors') {
      url = 'http://localhost:8081/api/doctors/all';
    } else if (this.userType === 'nutritionists') {
      url = 'http://localhost:8081/api/nutritionists/all';
    } else if (this.userType === 'patients') {
      url = 'http://localhost:8081/api/patients/all';
    }

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.isLoading = false;
        this.errorMessage = 'Erreur lors du chargement des données';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  applyFilters(): void {
    let result = [...this.users];

    if (this.userType !== 'patients') {
      if (this.statusFilter !== 'ALL') {
        result = result.filter(u => u.certificateStatus === this.statusFilter);
      }
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(u =>
        u.firstName?.toLowerCase().includes(term) ||
        u.lastName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      );
    }

    this.filteredUsers = result;
  }

  onSearch(): void { 
    this.applyFilters(); 
  }
  
  onFilterChange(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  countByStatus(status: string): number {
    if (this.userType === 'patients') return 0;
    return this.users.filter(u => u.certificateStatus === status).length;
  }

  openModal(user: any): void {
    this.selectedUser = { ...user };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedUser = null;
  }

  approve(user: any): void {
    this.actionLoading = true;
    let url = '';
    if (this.userType === 'doctors') {
      url = `http://localhost:8081/api/doctors/certificate/approve/${user.id}`;
    } else {
      url = `http://localhost:8081/api/nutritionists/certificate/approve/${user.id}`;
    }

    this.http.put(url, {}).subscribe({
      next: () => {
        this.actionLoading = false;
        const idx = this.users.findIndex(u => u.id === user.id);
        if (idx !== -1) this.users[idx].certificateStatus = 'APPROVED';
        if (this.selectedUser?.id === user.id) this.selectedUser.certificateStatus = 'APPROVED';
        this.applyFilters();
        this.successMessage = `${user.firstName} ${user.lastName} approuvé(e) avec succès.`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.actionLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l\'approbation.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  reject(user: any): void {
    this.actionLoading = true;
    let url = '';
    if (this.userType === 'doctors') {
      url = `http://localhost:8081/api/doctors/certificate/reject/${user.id}`;
    } else {
      url = `http://localhost:8081/api/nutritionists/certificate/reject/${user.id}`;
    }

    this.http.put(url, {}).subscribe({
      next: () => {
        this.actionLoading = false;
        const idx = this.users.findIndex(u => u.id === user.id);
        if (idx !== -1) this.users[idx].certificateStatus = 'REJECTED';
        if (this.selectedUser?.id === user.id) this.selectedUser.certificateStatus = 'REJECTED';
        this.applyFilters();
        this.successMessage = `${user.firstName} ${user.lastName} rejeté(e).`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.actionLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors du rejet.';
        setTimeout(() => this.errorMessage = '', 3000);
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

  getBloodTypeLabel(bt: string): string {
    const map: any = {
      A_POSITIVE: 'A+', A_NEGATIVE: 'A-',
      B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
      AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-',
      O_POSITIVE: 'O+', O_NEGATIVE: 'O-'
    };
    return map[bt] || bt || '—';
  }

  getCertUrl(path: string): string {
    return this.imageBaseUrl + path;
  }

  getTitle(): string {
    if (this.userType === 'doctors') return 'Médecins';
    if (this.userType === 'nutritionists') return 'Nutritionnistes';
    return 'Patients';
  }

  getIcon(): string {
    if (this.userType === 'doctors') return 'bi-person-badge-fill';
    if (this.userType === 'nutritionists') return 'bi-heart-pulse-fill';
    return 'bi-people-fill';
  }
}