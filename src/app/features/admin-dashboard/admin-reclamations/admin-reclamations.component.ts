import { Component, OnInit } from '@angular/core';
import { Reclamation } from '../../../services/reclamation.service';
import { ReclamationService } from '../../../services/reclamation.service';

@Component({
  selector: 'app-admin-reclamations',
  templateUrl: './admin-reclamations.component.html',
  styleUrls: ['./admin-reclamations.component.css']
})
export class AdminReclamationsComponent implements OnInit {
  adminId = 99;

  reclamations: Reclamation[] = [];
  filteredReclamations: Reclamation[] = [];

  responseMap: { [key: number]: string } = {};
  internalMap: { [key: number]: string } = {};

  searchTerm = '';
  selectedStatus = '';
  selectedCategory = '';

  successMessage = '';
  errorMessage = '';

  stats: any = {
    total: 0,
    open: 0,
    inProgress: 0,
    answered: 0,
    resolved: 0,
    rejected: 0
  };

  statuses = ['OPEN', 'IN_PROGRESS', 'ANSWERED', 'RESOLVED', 'REJECTED'];
  categories = [
    'RENDEZ_VOUS',
    'CONSULTATION',
    'PLAN_ALIMENTAIRE',
    'SUIVI_MEDICAL',
    'TECHNIQUE',
    'FACTURATION',
    'AUTRE'
  ];

  constructor(private reclamationService: ReclamationService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.reclamationService.getAll().subscribe({
      next: (data) => {
        this.reclamations = [...data].sort((a, b) =>
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        this.applyFilters();
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des réclamations.';
      }
    });

    this.reclamationService.getStats().subscribe({
      next: (data) => this.stats = data,
      error: () => {}
    });
  }

  applyFilters(): void {
    this.filteredReclamations = this.reclamations.filter((r) => {
      const matchesSearch =
        !this.searchTerm ||
        r.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        !this.selectedStatus || r.status === this.selectedStatus;

      const matchesCategory =
        !this.selectedCategory || r.category === this.selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedCategory = '';
    this.applyFilters();
  }

  updateStatus(id?: number, status?: any): void {
    if (!id || !status) return;

    this.reclamationService.updateStatus(id, status, this.adminId, 'ADMIN').subscribe({
      next: () => {
        this.successMessage = 'Statut mis à jour avec succès.';
        this.loadAll();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la mise à jour du statut.';
      }
    });
  }

  sendResponse(id?: number): void {
    if (!id) return;

    const response = this.responseMap[id] || '';
    const internalNote = this.internalMap[id] || '';

    if (!response.trim()) {
      this.errorMessage = 'La réponse est obligatoire.';
      return;
    }

    this.reclamationService.respond(
      id,
      response,
      internalNote,
      this.adminId,
      'ADMIN'
    ).subscribe({
      next: () => {
        this.successMessage = 'Réponse envoyée avec succès.';
        this.responseMap[id] = '';
        this.internalMap[id] = '';
        this.loadAll();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l’envoi de la réponse.';
      }
    });
  }

  deleteReclamation(id?: number): void {
    if (!id) return;

    const confirmed = confirm('Voulez-vous vraiment supprimer cette réclamation ?');
    if (!confirmed) return;

    this.reclamationService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Réclamation supprimée avec succès.';
        this.loadAll();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression.';
      }
    });
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'OPEN':
        return 'status-open';
      case 'IN_PROGRESS':
        return 'status-progress';
      case 'ANSWERED':
        return 'status-answered';
      case 'RESOLVED':
        return 'status-resolved';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return '';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'OPEN':
        return 'Ouverte';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'ANSWERED':
        return 'Répondue';
      case 'RESOLVED':
        return 'Résolue';
      case 'REJECTED':
        return 'Rejetée';
      default:
        return status || '';
    }
  }

  getPriorityLabel(priority?: string): string {
    switch (priority) {
      case 'LOW':
        return 'Faible';
      case 'MEDIUM':
        return 'Moyenne';
      case 'HIGH':
        return 'Haute';
      default:
        return priority || '';
    }
  }

  getCategoryLabel(category?: string): string {
    switch (category) {
      case 'RENDEZ_VOUS':
        return 'Rendez-vous';
      case 'CONSULTATION':
        return 'Consultation';
      case 'PLAN_ALIMENTAIRE':
        return 'Plan alimentaire';
      case 'SUIVI_MEDICAL':
        return 'Suivi médical';
      case 'TECHNIQUE':
        return 'Technique';
      case 'FACTURATION':
        return 'Facturation';
      case 'AUTRE':
        return 'Autre';
      default:
        return category || '';
    }
  }

  getRoleLabel(role?: string): string {
    switch (role) {
      case 'PATIENT':
        return 'Patient';
      case 'DOCTOR':
        return 'Médecin';
      case 'NUTRITIONNIST':
        return 'Nutritionniste';
      case 'ADMIN':
        return 'Admin';
      default:
        return role || '';
    }
  }
}