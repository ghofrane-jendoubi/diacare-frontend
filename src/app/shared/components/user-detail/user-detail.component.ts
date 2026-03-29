import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent {

  @Input() user: any = null;
  @Input() userType: 'doctor' | 'nutritionist' | 'patient' | null = null;
  @Output() close = new EventEmitter<void>();

  imageBaseUrl = 'http://localhost:8081/';

  onClose(): void {
    this.close.emit();
  }

  getStatusLabel(status: string): string {
    const map: any = {
      'PENDING': 'En attente',
      'APPROVED': 'Approuvé',
      'REJECTED': 'Rejeté'
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
}