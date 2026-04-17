import { Component, OnInit } from '@angular/core';
import { Reclamation, ReclamationService } from '../../../services/reclamation.service';

@Component({
  selector: 'app-patient-reclamations',
  templateUrl: './patient-reclamations.component.html',
  styleUrls: ['./patient-reclamations.component.css']
})
export class PatientReclamationsComponent implements OnInit {
  patientId = 1;

  reclamationForm: Reclamation = {
    title: '',
    description: '',
    category: 'AUTRE',
    priority: 'MEDIUM',
    createdByRole: 'PATIENT',
    createdById: 1,
    targetRole: 'DOCTOR'
  };

  reclamations: Reclamation[] = [];
  filteredReclamations: Reclamation[] = [];

  successMessage = '';
  errorMessage = '';
  isSubmitting = false;

  searchTerm = '';
  selectedStatus = '';
  selectedCategory = '';

  editingId: number | null = null;

  stats = {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  };

  categories = [
    'RENDEZ_VOUS',
    'CONSULTATION',
    'PLAN_ALIMENTAIRE',
    'SUIVI_MEDICAL',
    'TECHNIQUE',
    'FACTURATION',
    'AUTRE'
  ];

  priorities = ['LOW', 'MEDIUM', 'HIGH'];
  targetRoles = ['DOCTOR', 'NUTRITIONNIST', 'ADMIN'];
  statuses = ['OPEN', 'IN_PROGRESS', 'ANSWERED', 'RESOLVED', 'REJECTED'];

  constructor(private reclamationService: ReclamationService) {}

  ngOnInit(): void {
    this.loadReclamations();
  }

  loadReclamations(): void {
    this.reclamationService.getMine(this.patientId, 'PATIENT').subscribe({
      next: (data) => {
        this.reclamations = [...data].sort((a, b) =>
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        this.computeStats();
        this.applyFilters();
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des réclamations.';
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

  onCategoryChange(): void {
    if (this.reclamationForm.category === 'PLAN_ALIMENTAIRE') {
      this.reclamationForm.targetRole = 'NUTRITIONNIST';
    } else if (
      this.reclamationForm.category === 'CONSULTATION' ||
      this.reclamationForm.category === 'SUIVI_MEDICAL' ||
      this.reclamationForm.category === 'RENDEZ_VOUS'
    ) {
      this.reclamationForm.targetRole = 'DOCTOR';
    } else if (
      this.reclamationForm.category === 'TECHNIQUE' ||
      this.reclamationForm.category === 'FACTURATION'
    ) {
      this.reclamationForm.targetRole = 'ADMIN';
    }
  }

  submitReclamation(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.reclamationForm.title.trim()) {
      this.errorMessage = 'Le titre est obligatoire.';
      return;
    }

    if (!this.reclamationForm.description.trim()) {
      this.errorMessage = 'La description est obligatoire.';
      return;
    }

    this.isSubmitting = true;

    if (this.editingId) {
      const updatedPayload: Reclamation = {
        ...this.reclamationForm,
        id: this.editingId
      };

      this.reclamationService.create(updatedPayload).subscribe({
        next: () => {
          this.successMessage = 'Réclamation modifiée avec succès.';
          this.isSubmitting = false;
          this.cancelEdit();
          this.loadReclamations();
        },
        error: () => {
          this.isSubmitting = false;
          this.errorMessage = 'Erreur lors de la modification.';
        }
      });

      return;
    }

    this.reclamationService.create(this.reclamationForm).subscribe({
      next: () => {
        this.successMessage = 'Réclamation envoyée avec succès.';
        this.isSubmitting = false;
        this.resetForm();
        this.loadReclamations();
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Erreur lors de l’envoi de la réclamation.';
      }
    });
  }

  startEdit(r: Reclamation): void {
    if (r.status !== 'OPEN') {
      this.errorMessage = 'Vous pouvez modifier seulement une réclamation ouverte.';
      return;
    }

    this.editingId = r.id || null;
    this.reclamationForm = {
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      priority: r.priority,
      createdByRole: r.createdByRole,
      createdById: r.createdById,
      targetRole: r.targetRole,
      handledByRole: r.handledByRole,
      handledById: r.handledById,
      adminResponse: r.adminResponse,
      internalNote: r.internalNote,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      resolvedAt: r.resolvedAt
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.resetForm();
  }

  resetForm(): void {
    this.reclamationForm = {
      title: '',
      description: '',
      category: 'AUTRE',
      priority: 'MEDIUM',
      createdByRole: 'PATIENT',
      createdById: this.patientId,
      targetRole: 'DOCTOR'
    };
  }

  deleteReclamation(id?: number, status?: string): void {
    if (!id) return;

    if (status !== 'OPEN') {
      this.errorMessage = 'Vous pouvez supprimer seulement une réclamation ouverte.';
      return;
    }

    const confirmed = confirm('Voulez-vous vraiment supprimer cette réclamation ?');
    if (!confirmed) return;

    this.reclamationService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Réclamation supprimée avec succès.';
        this.loadReclamations();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression.';
      }
    });
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'OPEN':
        return 'open';
      case 'IN_PROGRESS':
        return 'in-progress';
      case 'ANSWERED':
        return 'answered';
      case 'RESOLVED':
        return 'resolved';
      case 'REJECTED':
        return 'rejected';
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