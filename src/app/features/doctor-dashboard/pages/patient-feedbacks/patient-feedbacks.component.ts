import { Component, OnInit } from '@angular/core';
import { PatientFeedback } from '../../models/patient-feedback.model';
import { PatientFeedbackService } from '../../services/patient-feedback.service';

@Component({
  selector: 'app-patient-feedbacks',
  templateUrl: './patient-feedbacks.component.html',
  styleUrls: ['./patient-feedbacks.component.css']
})
export class PatientFeedbacksComponent implements OnInit {
  feedbacks: PatientFeedback[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private feedbackService: PatientFeedbackService) {}

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  loadFeedbacks(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.feedbackService.getPatientFeedbacks().subscribe({
      next: (data) => {
        this.feedbacks = data;
        this.isLoading = false;
      },
      error: () => {
        this.feedbacks = [];
        this.errorMessage = 'Impossible de charger les retours pour le moment.';
        this.isLoading = false;
      }
    });
  }

  getEmotionLabel(emotion: string): string {
    switch (emotion) {
      case 'HAPPY': return 'Content';
      case 'SAD': return 'Triste / anxieux';
      default: return 'Neutre';
    }
  }

  getEmotionIcon(emotion: string): string {
    switch (emotion) {
      case 'HAPPY': return '😀';
      case 'SAD': return '😟';
      default: return '😐';
    }
  }
}
