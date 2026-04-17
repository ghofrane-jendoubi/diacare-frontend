import { Component, OnInit } from '@angular/core';
import { Reclamation } from '../../../services/reclamation.service';
import { ReclamationService } from '../../../services/reclamation.service';

@Component({
  selector: 'app-nutritionnist-reclamations',
  templateUrl: './nutritionnist-reclamations.component.html',
  styleUrls: ['./nutritionnist-reclamations.component.css']
})
export class NutritionnistReclamationsComponent implements OnInit {
  nutritionnistId = 3;

  reclamations: Reclamation[] = [];
  filteredReclamations: Reclamation[] = [];

  responseMap: { [key: number]: string } = {};
  internalMap: { [key: number]: string } = {};

  searchTerm = '';
  selectedStatus = '';

  successMessage = '';
  errorMessage = '';

  stats = {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  };

  statuses = ['OPEN', 'IN_PROGRESS', 'ANSWERED', 'RESOLVED', 'REJECTED'];

  constructor(private reclamationService: ReclamationService) {}

  ngOnInit(): void {
    this.loadReclamations();
  }

  loadReclamations(): void {
    this.reclamationService.getByTargetRole('NUTRITIONNIST').subscribe({
      next: (data) => {
        this.reclamations = [...data].sort((a, b) =>
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        this.computeStats();
        this.applyFilters();
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des réclamations du nutritionniste.';
      }
    });
  }

  computeStats(): void {
    this.stats.total = this.reclamations.length;
    this.stats.open = this.reclamations.filter(r => r.status === 'OPEN').length;
    this.stats.inProgress = this.reclamations.filter(r => r.status === 'IN_PROGRESS').length;
    this.stats.resolved = this.reclamations.filter(r => r.status === 'RESOLVED').length;
  }

  applyFilters(): void {
    this.filteredReclamations = this.reclamations.filter((r) => {
      const matchesSearch =
        !this.searchTerm ||
        r.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        !this.selectedStatus || r.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  updateStatus(id?: number, status?: any): void {
    if (!id || !status) return;

    this.reclamationService.updateStatus(id, status, this.nutritionnistId, 'NUTRITIONNIST').subscribe({
      next: () => {
        this.successMessage = 'Statut mis à jour avec succès.';
        this.loadReclamations();
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
      this.nutritionnistId,
      'NUTRITIONNIST'
    ).subscribe({
      next: () => {
        this.successMessage = 'Réponse envoyée avec succès.';
        this.responseMap[id] = '';
        this.internalMap[id] = '';
        this.loadReclamations();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l’envoi de la réponse.';
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
}