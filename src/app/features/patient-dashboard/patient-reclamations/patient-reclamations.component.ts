// patient-reclamations.component.ts
import { Component, OnInit } from '@angular/core';
import { Reclamation, ReclamationService } from '../../../services/reclamation.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patient-reclamations',
  templateUrl: './patient-reclamations.component.html',
  styleUrls: ['./patient-reclamations.component.css']
})
export class PatientReclamationsComponent implements OnInit {
  patientId: number = 0;
  patientName: string = '';

  reclamationForm: Reclamation = {
    title: '',
    description: '',
    category: 'AUTRE',
    priority: 'MEDIUM',
    createdByRole: 'PATIENT',
    createdById: 0,
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

  constructor(
    private reclamationService: ReclamationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPatientInfo();
    this.loadReclamations();
  }

  // ✅ Récupérer l'ID du patient connecté
  loadPatientInfo(): void {
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser && currentUser.id) {
      this.patientId = currentUser.id;
      this.patientName = `${currentUser.firstName} ${currentUser.lastName}`;
      
      // Mettre à jour le formulaire avec l'ID
      this.reclamationForm.createdById = this.patientId;
      
      console.log('Patient connecté:', {
        id: this.patientId,
        name: this.patientName
      });
    } else {
      console.error('Aucun patient connecté');
      // Fallback - à enlever en production
      this.patientId = 1;
      this.reclamationForm.createdById = 1;
    }
  }

  loadReclamations(): void {
    if (!this.patientId) {
      this.errorMessage = 'Impossible d\'identifier le patient.';
      return;
    }

    this.reclamationService.getMine(this.patientId, 'PATIENT').subscribe({
      next: (data) => {
        this.reclamations = [...data].sort((a, b) =>
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        this.computeStats();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erreur chargement réclamations:', err);
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
      this.reclamationForm.targetRole = 'NUTRITIONIST';
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

  // patient-reclamations.component.ts - Modifiez submitReclamation()

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

  // ✅ Construire le payload selon ce que le backend attend
  // Le backend veut peut-être un objet "patient" avec "id"
  const payload: any = {
    title: this.reclamationForm.title,
    description: this.reclamationForm.description,
    category: this.reclamationForm.category,
    priority: this.reclamationForm.priority,
    createdByRole: 'PATIENT',
    targetRole: this.reclamationForm.targetRole,
    // Option 1: Si le backend attend createdById
    createdById: this.patientId,
    // Option 2: Si le backend attend un objet patient
    patient: { id: this.patientId }
  };

  console.log('📤 Envoi payload:', JSON.stringify(payload, null, 2));

  if (this.editingId) {
    payload.id = this.editingId;
    this.reclamationService.update(this.editingId, payload).subscribe({
      next: () => {
        this.successMessage = 'Réclamation modifiée avec succès.';
        this.isSubmitting = false;
        this.cancelEdit();
        this.loadReclamations();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('Erreur modification:', err);
        this.isSubmitting = false;
        this.errorMessage = 'Erreur lors de la modification.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
    return;
  }

  // Création
  this.reclamationService.create(payload).subscribe({
    next: (response) => {
      console.log('✅ Réponse:', response);
      this.successMessage = 'Réclamation envoyée avec succès.';
      this.isSubmitting = false;
      this.resetForm();
      this.loadReclamations();
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (err) => {
      console.error('❌ Erreur envoi:', err);
      if (err.error && typeof err.error === 'object') {
        console.error('Détails erreur backend:', err.error);
      }
      this.isSubmitting = false;
      this.errorMessage = err.error?.message || 'Erreur lors de l’envoi de la réclamation.';
      setTimeout(() => this.errorMessage = '', 3000);
    }
  });
}

  startEdit(r: Reclamation): void {
    if (r.status !== 'OPEN') {
      this.errorMessage = 'Vous pouvez modifier seulement une réclamation ouverte.';
      setTimeout(() => this.errorMessage = '', 3000);
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
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    const confirmed = confirm('Voulez-vous vraiment supprimer cette réclamation ?');
    if (!confirmed) return;

    this.reclamationService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Réclamation supprimée avec succès.';
        this.loadReclamations();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        this.errorMessage = 'Erreur lors de la suppression.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  // ✅ Méthode pour rafraîchir les données
  refreshData(): void {
    this.loadPatientInfo();
    this.loadReclamations();
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