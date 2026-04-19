// admin-reclamations.component.ts
import { Component, OnInit } from '@angular/core';
import { Reclamation, ReclamationService } from '../../../services/reclamation.service';
import { UserNameService } from '../../../services/user-name.service';

@Component({
  selector: 'app-admin-reclamations',
  templateUrl: './admin-reclamations.component.html',
  styleUrls: ['./admin-reclamations.component.css']
})
export class AdminReclamationsComponent implements OnInit {
  adminId = 99;

  reclamations: Reclamation[] = [];
  filteredReclamations: Reclamation[] = [];
  
  // Map pour stocker les noms des utilisateurs
  userNames: Map<number, string> = new Map();
  isLoadingNames = false;

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

  constructor(
    private reclamationService: ReclamationService,
    private userNameService: UserNameService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.reclamationService.getAll().subscribe({
      next: (data) => {
        this.reclamations = [...data].sort((a, b) =>
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        
        // Charger les noms des utilisateurs
        this.loadUserNames();
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

  loadUserNames(): void {
    this.isLoadingNames = true;
    
    // Récupérer les IDs uniques des utilisateurs
    const uniqueUsers = new Map<number, string>();
    this.reclamations.forEach(r => {
      if (r.createdById && !uniqueUsers.has(r.createdById)) {
        uniqueUsers.set(r.createdById, r.createdByRole || '');
      }
    });
    
    console.log('=== UNIQUE USERS TO LOAD ===');
    console.log('Users:', Array.from(uniqueUsers.entries()));
    
    const users = Array.from(uniqueUsers.entries()).map(([id, role]) => ({ id, role }));
    
    if (users.length === 0) {
      this.isLoadingNames = false;
      return;
    }
    
    this.userNameService.getMultipleUserNames(users).subscribe({
      next: (namesMap: Map<number, string>) => {
        console.log('=== LOADED NAMES ===');
        console.log('Names map:', Array.from(namesMap.entries()));
        this.userNames = namesMap;
        this.isLoadingNames = false;
      },
      error: (err) => {
        console.error('Error loading names:', err);
        this.isLoadingNames = false;
      }
    });
  }

  getUserDisplayName(reclamation: Reclamation): string {
    // Si le nom est déjà dans le cache
    if (this.userNames.has(reclamation.createdById!)) {
      return this.userNames.get(reclamation.createdById!)!;
    }
    return this.getDefaultUserName(reclamation.createdById, reclamation.createdByRole);
  }

  getDefaultUserName(userId?: number, role?: string): string {
    if (!userId) return 'Inconnu';
    switch (role) {
      case 'PATIENT': return `Patient #${userId}`;
      case 'DOCTOR': return `Dr. #${userId}`;
      case 'NUTRITIONNIST': return `Nutritionniste #${userId}`;
      default: return `Utilisateur #${userId}`;
    }
  }

  getUserIcon(role?: string): string {
    switch (role) {
      case 'PATIENT': return 'bi-person';
      case 'DOCTOR': return 'bi-person-badge';
      case 'NUTRITIONNIST': return 'bi-apple';
      case 'ADMIN': return 'bi-shield';
      default: return 'bi-question-circle';
    }
  }

  getRoleClass(role?: string): string {
    switch (role) {
      case 'PATIENT': return 'role-patient';
      case 'DOCTOR': return 'role-doctor';
      case 'NUTRITIONNIST': return 'role-nutritionnist';
      case 'ADMIN': return 'role-admin';
      default: return '';
    }
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
      case 'OPEN': return 'status-open';
      case 'IN_PROGRESS': return 'status-progress';
      case 'ANSWERED': return 'status-answered';
      case 'RESOLVED': return 'status-resolved';
      case 'REJECTED': return 'status-rejected';
      default: return '';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'OPEN': return 'Ouverte';
      case 'IN_PROGRESS': return 'En cours';
      case 'ANSWERED': return 'Répondue';
      case 'RESOLVED': return 'Résolue';
      case 'REJECTED': return 'Rejetée';
      default: return status || '';
    }
  }

  getPriorityLabel(priority?: string): string {
    switch (priority) {
      case 'LOW': return 'Faible';
      case 'MEDIUM': return 'Moyenne';
      case 'HIGH': return 'Haute';
      default: return priority || '';
    }
  }

  getCategoryLabel(category?: string): string {
    switch (category) {
      case 'RENDEZ_VOUS': return 'Rendez-vous';
      case 'CONSULTATION': return 'Consultation';
      case 'PLAN_ALIMENTAIRE': return 'Plan alimentaire';
      case 'SUIVI_MEDICAL': return 'Suivi médical';
      case 'TECHNIQUE': return 'Technique';
      case 'FACTURATION': return 'Facturation';
      case 'AUTRE': return 'Autre';
      default: return category || '';
    }
  }

  getRoleLabel(role?: string): string {
    switch (role) {
      case 'PATIENT': return 'Patient';
      case 'DOCTOR': return 'Médecin';
      case 'NUTRITIONNIST': return 'Nutritionniste';
      case 'ADMIN': return 'Admin';
      default: return role || '';
    }
  }
}