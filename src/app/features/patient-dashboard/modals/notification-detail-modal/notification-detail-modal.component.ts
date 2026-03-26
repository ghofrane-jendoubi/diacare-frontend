import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PaymentService } from '../../../../services/payment.service';
import { AppointmentService } from '../../../../services/appointment.service';

@Component({
  selector: 'app-notification-detail-modal',
  templateUrl: './notification-detail-modal.component.html',
  styleUrls: ['./notification-detail-modal.component.css']
})
export class NotificationDetailModalComponent implements OnInit {
  @Input() notification: any;
  @Input() patientId: number = 1;
  @Output() closeModal = new EventEmitter<void>();

  appointment: any = null;
  doctorName: string = 'Dr. Karim El Fassi';
  isPaid: boolean = false;
  isDateExpired: boolean = false;
  isLoading: boolean = true;
  showPaymentModal: boolean = false;
  appointmentFee: number = 50;
  
  // Pour stocker les modifications à afficher
  changesList: string[] = [];

  constructor(
    private paymentService: PaymentService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit() {
    console.log('=== NOTIFICATION DETAIL MODAL INIT ===');
    console.log('TITRE:', this.notification?.title);
    console.log('MESSAGE:', this.notification?.message);
    
    // Extraire les modifications du message
    this.extractChangesFromMessage();
    
    const isAppointment = this.notification?.title?.toLowerCase().includes('rendez-vous');
    
    if (isAppointment) {
      const appointmentId = this.extractAppointmentId(this.notification.message);
      console.log('Appointment ID extrait:', appointmentId);
      
      if (appointmentId) {
        this.loadAppointmentDetails(appointmentId);
      } else {
        this.isLoading = false;
      }
    } else {
      this.isLoading = false;
    }
  }

  // ✅ Extraire les modifications du message
  extractChangesFromMessage() {
    const message = this.notification?.message || '';
    const changes: string[] = [];
    
    // Chercher la section "Modifications effectuées"
    const changesMatch = message.match(/📝 Modifications effectuées:\n([\s\S]*?)(?=\n\n|$)/);
    if (changesMatch) {
      const changesText = changesMatch[1];
      const lines = changesText.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('•')) {
          changes.push(line.trim());
        }
      }
    }
    
    this.changesList = changes;
    console.log('Modifications extraites:', this.changesList);
  }

  loadAppointmentDetails(appointmentId: number) {
    this.isLoading = true;
    
    this.appointmentService.getAppointmentById(appointmentId).subscribe({
      next: (appointment: any) => {
        console.log('Rendez-vous chargé depuis API:', appointment);
        this.appointment = appointment;
        this.appointmentFee = appointment.fee || 50;
        this.checkPaymentStatus();
        this.checkDateExpired();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement rendez-vous:', err);
        this.isLoading = false;
      }
    });
  }

  checkPaymentStatus() {
    if (this.appointment && this.appointment.id) {
      this.paymentService.isAppointmentPaid(this.appointment.id).subscribe({
        next: (response) => {
          this.isPaid = response.isPaid;
          console.log('Statut paiement:', this.isPaid);
        },
        error: (err) => {
          console.error('Erreur vérification paiement:', err);
          this.isPaid = false;
        }
      });
    }
  }

  checkDateExpired() {
    if (this.appointment && this.appointment.startTime) {
      const appointmentDate = new Date(this.appointment.startTime);
      this.isDateExpired = appointmentDate < new Date();
      console.log('Date expirée:', this.isDateExpired);
    }
  }

  extractAppointmentId(message: string): number | null {
  if (!message) return null;
  
  // Chercher /patient/appointments/24
  const linkMatch = message.match(/\/appointments\/(\d+)/);
  if (linkMatch) return parseInt(linkMatch[1]);
  
  // Chercher Rendez-vous #24
  const hashMatch = message.match(/Rendez-vous\s*#(\d+)/i);
  if (hashMatch) return parseInt(hashMatch[1]);
  
  return null;
}
  openPaymentModal() {
    console.log('Ouverture du modal de paiement');
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
  }

  onPaymentSuccess(appointment: any) {
    console.log('Paiement réussi pour:', appointment);
    this.isPaid = true;
    this.showPaymentModal = false;
    this.checkPaymentStatus();
    this.showToast('Paiement effectué avec succès !', 'success');
  }

  formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatDisplayTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getAppointmentDate(): string {
  const dateStr = this.appointment?.startTime 
               || this.appointment?.start 
               || this.appointment?.startDate;
  if (dateStr) return this.formatDisplayDate(dateStr);
  return 'Non spécifiée';
}

getAppointmentTime(): string {
  const dateStr = this.appointment?.startTime 
               || this.appointment?.start 
               || this.appointment?.startDate;
  if (dateStr) return this.formatDisplayTime(dateStr);
  return 'Non spécifiée';
}

  getAppointmentFee(): number {
    return this.appointment?.fee || this.appointmentFee;
  }

  getAppointmentTitle(): string {
    return this.appointment?.title || 'Consultation médicale';
  }

  getAppointmentMeetLink(): string {
    return this.appointment?.meetLink || '#';
  }

  showToast(message: string, type: 'success' | 'error' | 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-${type}`;
    toast.innerHTML = `
      <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  formatFullDate(date: string): string {
    if (!date) return 'Date inconnue';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getIcon(title: string): string {
    if (!title) return 'bi-bell';
    if (title.includes('Rendez-vous')) return 'bi-calendar-check';
    if (title.includes('Résultat')) return 'bi-file-medical';
    if (title.includes('Rappel')) return 'bi-alarm';
    return 'bi-bell';
  }

  close() {
    this.closeModal.emit();
  }
}