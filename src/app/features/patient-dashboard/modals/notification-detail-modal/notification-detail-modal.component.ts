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
  @Input() patientId: number | null = null;
  @Output() closeModal = new EventEmitter<void>();

  appointment: any = null;
  doctorName: string = 'Chargement...';
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
    console.log('Notification reçue:', this.notification);
    console.log('TITRE:', this.notification?.title);
    console.log('MESSAGE:', this.notification?.message);
    
    // Récupérer l'ID du patient depuis localStorage si non fourni
    if (!this.patientId) {
      const patientIdStr = localStorage.getItem('patient_id');
      if (patientIdStr) {
        this.patientId = parseInt(patientIdStr);
        console.log('✅ Patient ID récupéré depuis localStorage:', this.patientId);
      } else {
        console.warn('⚠️ Patient ID non trouvé dans localStorage');
      }
    }
    
    // Extraire les modifications du message
    this.extractChangesFromMessage();
    
    const isAppointment = this.notification?.title?.toLowerCase().includes('rendez-vous');
    console.log('Est-ce un rendez-vous?', isAppointment);
    
    if (isAppointment) {
      const appointmentId = this.extractAppointmentId(this.notification.message);
      console.log('Appointment ID extrait:', appointmentId);
      
      if (appointmentId) {
        this.loadAppointmentDetails(appointmentId);
      } else {
        console.error('❌ Impossible d\'extraire l\'ID du rendez-vous depuis le message');
        this.isLoading = false;
        this.appointment = null;
      }
    } else {
      this.isLoading = false;
    }
  }

  extractChangesFromMessage() {
    const message = this.notification?.message || '';
    const changes: string[] = [];
    
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
    console.log('🔍 Chargement rendez-vous ID:', appointmentId);
    this.isLoading = true;
    
    this.appointmentService.getAppointmentById(appointmentId).subscribe({
      next: (appointment: any) => {
        console.log('✅ Rendez-vous chargé depuis API:', appointment);
        console.log('📅 startTime:', appointment.startTime);
        console.log('🆔 doctorId:', appointment.doctorId);
        console.log('🆔 patientId:', appointment.patientId);
        
        this.appointment = appointment;
        this.appointmentFee = appointment.fee || 50;
        
        // Charger les informations du médecin
        if (appointment.doctorId) {
          this.loadDoctorInfo(appointment.doctorId);
        } else {
          console.warn('⚠️ Pas de doctorId dans le rendez-vous');
          this.doctorName = 'Médecin';
        }
        
        this.checkPaymentStatus();
        this.checkDateExpired();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('❌ Erreur chargement rendez-vous:', err);
        this.isLoading = false;
        this.appointment = null;
        this.doctorName = 'Médecin non trouvé';
      }
    });
  }

  loadDoctorInfo(doctorId: number) {
    console.log('🔍 Chargement médecin ID:', doctorId);
    
    this.appointmentService.getDoctorById(doctorId).subscribe({
      next: (doctor: any) => {
        console.log('✅ Médecin chargé:', doctor);
        this.doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
      },
      error: (err: any) => {
        console.error('❌ Erreur chargement médecin:', err);
        this.doctorName = 'Médecin';
      }
    });
  }

  checkPaymentStatus() {
    console.log('🔍 Vérification paiement pour appointment:', this.appointment?.id);
    
    if (this.appointment && this.appointment.id) {
      this.paymentService.isAppointmentPaid(this.appointment.id).subscribe({
        next: (response: any) => {
          console.log('✅ Réponse paiement:', response);
          this.isPaid = response.isPaid;
          console.log('Statut paiement:', this.isPaid);
        },
        error: (err: any) => {
          console.error('❌ Erreur vérification paiement:', err);
          this.isPaid = false;
        }
      });
    } else {
      console.warn('⚠️ Impossible de vérifier le paiement: appointment.id manquant');
      this.isPaid = false;
    }
  }

  checkDateExpired() {
    if (this.appointment && this.appointment.startTime) {
      const appointmentDate = new Date(this.appointment.startTime);
      this.isDateExpired = appointmentDate < new Date();
      console.log('Date expirée:', this.isDateExpired);
    } else {
      console.warn('⚠️ Pas de startTime dans le rendez-vous');
      this.isDateExpired = false;
    }
  }

  extractAppointmentId(message: string): number | null {
    if (!message) return null;
    
    console.log('🔍 Extraction ID depuis message:', message);
    
    // Chercher /patient/appointments/24 ou /appointments/24
    const linkMatch = message.match(/\/appointments\/(\d+)/);
    if (linkMatch) {
      console.log('✅ ID trouvé via lien:', linkMatch[1]);
      return parseInt(linkMatch[1]);
    }
    
    // Chercher Rendez-vous #24
    const hashMatch = message.match(/Rendez-vous\s*#(\d+)/i);
    if (hashMatch) {
      console.log('✅ ID trouvé via #:', hashMatch[1]);
      return parseInt(hashMatch[1]);
    }
    
    // Chercher un nombre après "ID:" ou "id:"
    const idMatch = message.match(/id[:\s]*(\d+)/i);
    if (idMatch) {
      console.log('✅ ID trouvé via id:', idMatch[1]);
      return parseInt(idMatch[1]);
    }
    
    console.warn('⚠️ Aucun ID trouvé dans le message');
    return null;
  }

  openPaymentModal() {
    console.log('Ouverture du modal de paiement');
    console.log('Appointment:', this.appointment);
    
    if (!this.appointment) {
      console.error('❌ Appointment non défini');
      this.showToast('Erreur: Informations du rendez-vous non disponibles', 'error');
      return;
    }
    
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
    if (!dateString) return 'Non spécifiée';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Non spécifiée';
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'Non spécifiée';
    }
  }

  formatDisplayTime(dateString: string): string {
    if (!dateString) return 'Non spécifiée';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Non spécifiée';
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Non spécifiée';
    }
  }

  getAppointmentDate(): string {
    if (!this.appointment) {
      return 'Non spécifiée';
    }
    
    const dateStr = this.appointment.startTime 
                 || this.appointment.start 
                 || this.appointment.startDate;
    
    if (dateStr) {
      return this.formatDisplayDate(dateStr);
    }
    return 'Non spécifiée';
  }

  getAppointmentTime(): string {
    if (!this.appointment) {
      return 'Non spécifiée';
    }
    
    const dateStr = this.appointment.startTime 
                 || this.appointment.start 
                 || this.appointment.startDate;
    
    if (dateStr) {
      return this.formatDisplayTime(dateStr);
    }
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
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Date inconnue';
      return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Date inconnue';
    }
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