import { Component, OnInit } from '@angular/core';
import { Reclamation, ReclamationService } from '../../../services/reclamation.service';

@Component({
  selector: 'app-doctor-send-reclamation',
  templateUrl: './doctor-send-reclamation.component.html',
  styleUrls: ['./doctor-send-reclamation.component.css']
})
export class DoctorSendReclamationComponent implements OnInit {
  doctorId = 2;

  reclamationForm: Reclamation = {
    title: '',
    description: '',
    category: 'AUTRE',
    priority: 'MEDIUM',
    createdByRole: 'DOCTOR',
    createdById: 2,
    targetRole: 'ADMIN'
  };

  reclamations: Reclamation[] = [];
  successMessage = '';
  errorMessage = '';
  isSubmitting = false;

  categories = ['TECHNIQUE', 'FACTURATION', 'AUTRE'];
  priorities = ['LOW', 'MEDIUM', 'HIGH'];

  constructor(private reclamationService: ReclamationService) {}

  ngOnInit(): void {
    this.loadMyReclamations();
  }

  loadMyReclamations(): void {
    this.reclamationService.getMine(this.doctorId, 'DOCTOR').subscribe({
      next: (data) => {
        this.reclamations = [...data].sort((a, b) =>
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des réclamations.';
      }
    });
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

    this.reclamationService.create(this.reclamationForm).subscribe({
      next: () => {
        this.successMessage = 'Réclamation envoyée à l’admin avec succès.';
        this.isSubmitting = false;
        this.reclamationForm = {
          title: '',
          description: '',
          category: 'AUTRE',
          priority: 'MEDIUM',
          createdByRole: 'DOCTOR',
          createdById: this.doctorId,
          targetRole: 'ADMIN'
        };
        this.loadMyReclamations();
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Erreur lors de l’envoi.';
      }
    });
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
}