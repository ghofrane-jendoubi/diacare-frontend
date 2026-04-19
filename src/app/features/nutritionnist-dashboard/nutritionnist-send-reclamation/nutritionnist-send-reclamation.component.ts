// nutritionnist-send-reclamation.component.ts
import { Component, OnInit } from '@angular/core';
import { Reclamation, ReclamationService } from '../../../services/reclamation.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-nutritionnist-send-reclamation',
  templateUrl: './nutritionnist-send-reclamation.component.html',
  styleUrls: ['./nutritionnist-send-reclamation.component.css']
})
export class NutritionnistSendReclamationComponent implements OnInit {
  nutritionnistId: number = 0;
  nutritionnistName: string = '';
  isUserLoaded: boolean = false;

  reclamationForm: Reclamation = {
    title: '',
    description: '',
    category: 'AUTRE',
    priority: 'MEDIUM',
    createdByRole: 'NUTRITIONIST',  // ✅ Utiliser NUTRITIONIST (pas NUTRITIONNIST)
    createdById: 0,
    targetRole: 'ADMIN'
  };

  reclamations: Reclamation[] = [];
  successMessage = '';
  errorMessage = '';
  isSubmitting = false;

  categories = ['TECHNIQUE', 'FACTURATION', 'AUTRE'];
  priorities = ['LOW', 'MEDIUM', 'HIGH'];

  constructor(
    private reclamationService: ReclamationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadNutritionnistInfo();
  }

 
loadNutritionnistInfo(): void {
  const currentUser = this.authService.getCurrentUser();
  
  console.log('Utilisateur courant:', currentUser);
  
  // Accepter les deux formes
  if (currentUser && (currentUser.role === 'NUTRITIONIST' || currentUser.role === 'NUTRITIONNIST')) {
    this.nutritionnistId = currentUser.id;
    this.nutritionnistName = `${currentUser.firstName} ${currentUser.lastName}`;
    this.reclamationForm.createdById = this.nutritionnistId;
    this.isUserLoaded = true;
    
    console.log('✅ Nutritionniste connecté:', {
      id: this.nutritionnistId,
      name: this.nutritionnistName,
      role: currentUser.role
    });
    
    this.loadMyReclamations();
  } else {
    console.error('❌ L\'utilisateur connecté n\'est PAS un nutritionniste!');
    console.error('Rôle actuel:', currentUser?.role);
    this.errorMessage = 'Erreur: Vous devez être connecté en tant que nutritionniste.';
  }
}

  loadMyReclamations(): void {
    if (!this.nutritionnistId) {
      this.errorMessage = 'Impossible d\'identifier le nutritionniste.';
      return;
    }

    this.reclamationService.getMine(this.nutritionnistId, 'NUTRITIONIST').subscribe({
      next: (data) => {
        this.reclamations = [...data].sort((a, b) =>
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
      },
      error: (err) => {
        console.error('Erreur chargement réclamations:', err);
        this.errorMessage = 'Erreur lors du chargement des réclamations.';
      }
    });
  }

  submitReclamation(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.isUserLoaded || !this.nutritionnistId) {
      this.errorMessage = 'Veuillez patienter, chargement de vos informations...';
      return;
    }

    if (!this.reclamationForm.title.trim()) {
      this.errorMessage = 'Le titre est obligatoire.';
      return;
    }

    if (!this.reclamationForm.description.trim()) {
      this.errorMessage = 'La description est obligatoire.';
      return;
    }

    // Forcer le bon rôle
    this.reclamationForm.createdById = this.nutritionnistId;
    this.reclamationForm.createdByRole = 'NUTRITIONIST';

    console.log('📤 Envoi réclamation avec:', {
      createdById: this.nutritionnistId,
      createdByRole: 'NUTRITIONIST'
    });

    this.isSubmitting = true;

    this.reclamationService.create(this.reclamationForm).subscribe({
      next: () => {
        this.successMessage = 'Réclamation envoyée avec succès.';
        this.isSubmitting = false;
        this.resetForm();
        this.loadMyReclamations();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('Erreur envoi:', err);
        this.isSubmitting = false;
        this.errorMessage = 'Erreur lors de l’envoi.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  resetForm(): void {
    this.reclamationForm = {
      title: '',
      description: '',
      category: 'AUTRE',
      priority: 'MEDIUM',
      createdByRole: 'NUTRITIONIST',
      createdById: this.nutritionnistId,
      targetRole: 'ADMIN'
    };
  }

  refreshData(): void {
    this.loadNutritionnistInfo();
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'OPEN': return 'open';
      case 'IN_PROGRESS': return 'in-progress';
      case 'ANSWERED': return 'answered';
      case 'RESOLVED': return 'resolved';
      case 'REJECTED': return 'rejected';
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
      case 'TECHNIQUE': return 'Technique';
      case 'FACTURATION': return 'Facturation';
      case 'AUTRE': return 'Autre';
      default: return category || '';
    }
  }
}