import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../../services/appointment.service';
import { NotificationService } from '../../../../services/notification.service';
import { PaymentService } from '../../../../services/payment.service';

@Component({
  selector: 'app-doctor-appointments',
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.css']
})
export class DoctorAppointmentsComponent implements OnInit, OnDestroy {
  doctorId: string | null = null; // Changé: plus de valeur statique
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  loading = true;
  searchTerm = '';
  filterStatus = 'all';
  refreshInterval: any;

  // Modal d'édition
  showEditModal = false;
  editingAppointment: any = null;
  editForm = {
    id: null,
    title: '',
    date: '',
    time: '',
    duration: 30,
    meetLink: '',
    description: '',
    fee: 0
  };

  constructor(
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du médecin connecté depuis localStorage
    this.doctorId = localStorage.getItem('doctor_id');
    
    // Vérifier si le médecin est connecté
    if (!this.doctorId) {
      console.error('Médecin non connecté');
      this.showToast('Veuillez vous connecter', 'error');
      this.router.navigate(['/doctor/login']);
      return;
    }
    
    this.loadAppointments();
    this.refreshInterval = setInterval(() => {
      this.loadAppointments();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadAppointments() {
  // Vérifier que doctorId existe avant de charger
  if (!this.doctorId) {
    console.error('Doctor ID non disponible');
    return;
  }
  
  this.loading = true;
  // ✅ Convertir le string en number avec parseInt ou +
  this.appointmentService.getDoctorAppointments(parseInt(this.doctorId)).subscribe({
    next: (data) => {
      this.appointments = data.map(app => ({
        ...app,
        patientId: app.patientId || app.patient?.id || null,
        patientName: app.patientName || 
                     (app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : 'Patient'),
        isExpired: new Date(app.startTime) < new Date(),
        isPaid: app.paid || false,
        status: this.getAppointmentStatus(app)
      }));
      this.applyFilters();
      this.loading = false;
    },
    error: (err) => {
      console.error('Erreur:', err);
      this.loading = false;
      if (err.status === 401) {
        this.router.navigate(['/doctor/login']);
      }
    }
  });
}
  getAppointmentStatus(appointment: any): string {
    const now = new Date();
    const startDate = new Date(appointment.startTime);
    
    if (appointment.status === 'annulé') return 'annulé';
    if (appointment.paid) return 'payé';
    if (startDate < now) return 'expiré';
    if (!appointment.paid && startDate > now) return 'en_attente_paiement';
    return 'planifié';
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'payé': 'Payé',
      'en_attente_paiement': 'En attente de paiement',
      'expiré': 'Expiré',
      'annulé': 'Annulé',
      'planifié': 'Planifié'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'payé': 'status-paid',
      'en_attente_paiement': 'status-pending',
      'expiré': 'status-expired',
      'annulé': 'status-cancelled',
      'planifié': 'status-scheduled'
    };
    return classes[status] || 'status-default';
  }

  getStatusIcon(status: string): string {
    const icons: any = {
      'payé': 'bi-check-circle',
      'en_attente_paiement': 'bi-clock',
      'expiré': 'bi-calendar-x',
      'annulé': 'bi-x-circle',
      'planifié': 'bi-calendar-check'
    };
    return icons[status] || 'bi-question-circle';
  }

  getPatientInitial(patientName: string): string {
    if (!patientName) return 'P';
    return patientName.charAt(0).toUpperCase();
  }

  getPaidCount(): number {
    return this.appointments.filter(a => a.status === 'payé').length;
  }

  getPendingCount(): number {
    return this.appointments.filter(a => a.status === 'en_attente_paiement').length;
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

  applyFilters() {
    let filtered = [...this.appointments];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.patientName?.toLowerCase().includes(term) ||
        app.title?.toLowerCase().includes(term)
      );
    }

    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === this.filterStatus);
    }

    this.filteredAppointments = filtered;
  }

  setFilter(status: string) {
    this.filterStatus = status;
    this.applyFilters();
  }

  // ✅ Vérifier si le rendez-vous peut être modifié
  canEdit(appointment: any): boolean {
    return !appointment.isExpired && !appointment.isPaid && appointment.status !== 'annulé';
  }

  // ✅ Vérifier si le rendez-vous peut être annulé
  canCancel(appointment: any): boolean {
    return !appointment.isExpired && !appointment.isPaid && appointment.status !== 'annulé';
  }

  openEditModal(appointment: any) {
    if (!this.canEdit(appointment)) {
      if (appointment.isPaid) {
        alert('Impossible de modifier un rendez-vous déjà payé');
      } else if (appointment.isExpired) {
        alert('Impossible de modifier un rendez-vous expiré');
      }
      return;
    }
    
    this.editingAppointment = appointment;
    this.editForm = {
      id: appointment.id,
      title: appointment.title,
      date: this.formatDateForInput(new Date(appointment.startTime)),
      time: this.formatTimeForInput(new Date(appointment.startTime)),
      duration: this.calculateDuration(appointment.startTime, appointment.endTime),
      meetLink: appointment.meetLink || '',
      description: appointment.description || '',
      fee: appointment.fee || 50
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingAppointment = null;
  }

  generateMeetLink() {
    const meetingId = Math.random().toString(36).substring(2, 10);
    this.editForm.meetLink = `https://meet.google.com/${meetingId}`;
  }

updateAppointment() {
  const dateStr = this.editForm.date;
  const timeStr = this.editForm.time;
  
  if (!dateStr || !timeStr) {
    this.showToast('Veuillez renseigner la date et l\'heure', 'error');
    return;
  }
  
  // ✅ Créer la date correctement
  const [year, month, day] = dateStr.split('-');
  const [hour, minute] = timeStr.split(':');
  const start = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
  
  if (isNaN(start.getTime())) {
    this.showToast('Date invalide', 'error');
    return;
  }
  
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + this.editForm.duration);

  const originalPatientId = this.editingAppointment?.patientId;
  const originalAppointmentId = this.editingAppointment?.id;

  // ✅ Format simple pour Java : "2026-04-01 06:00:00"
  const formatForJava = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const updatedData: any = {};
  
  // ✅ Ne modifier que ce qui a changé
  if (this.editForm.title !== this.editingAppointment.title) updatedData.title = this.editForm.title;
  if (this.editForm.meetLink !== this.editingAppointment.meetLink) updatedData.meetLink = this.editForm.meetLink;
  if (this.editForm.description !== this.editingAppointment.description) updatedData.description = this.editForm.description;
  if (this.editForm.fee !== this.editingAppointment.fee) updatedData.fee = this.editForm.fee;
  
  // ✅ Toujours mettre à jour la date/heure si modifiée
  const originalDate = new Date(this.editingAppointment.startTime);
  const originalDateStr = this.formatDateForInput(originalDate);
  const originalTimeStr = this.formatTimeForInput(originalDate);
  
  if (dateStr !== originalDateStr || timeStr !== originalTimeStr) {
    updatedData.startTime = formatForJava(start);
    updatedData.endTime = formatForJava(end);
  }

  console.log('📦 Données à mettre à jour:', updatedData);

  // ✅ Si rien n'a changé, ne pas envoyer
  if (Object.keys(updatedData).length === 0) {
    this.showToast('Aucune modification détectée', 'info');
    this.closeEditModal();
    return;
  }

  this.appointmentService.updateAppointment(this.editForm.id!, updatedData).subscribe({
    next: (response) => {
      console.log('✅ Rendez-vous modifié:', response);
      
      if (!originalPatientId) {
        this.showToast('Erreur: ID patient manquant', 'error');
        return;
      }

      const formattedDate = start.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const formattedTime = start.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const notificationMessage = `Rendez-vous #${originalAppointmentId} modifié : "${this.editForm.title}" 
        prévu le ${formattedDate} à ${formattedTime}. 
        Montant: ${this.editForm.fee} TND. 
        Lien: ${this.editForm.meetLink || 'À venir'}`;

      this.notificationService.sendNotification(
        originalPatientId,
        'Rendez-vous modifié',
        notificationMessage,
        `/patient/appointments/${originalAppointmentId}`
      ).subscribe({
        next: () => this.showToast('Notification envoyée au patient', 'success'),
        error: (err) => console.error('Erreur notification:', err)
      });

      this.loadAppointments();
      this.closeEditModal();
      this.showToast('Rendez-vous modifié avec succès', 'success');
    },
    error: (err) => {
      console.error('Erreur modification:', err);
      this.showToast('Erreur lors de la modification', 'error');
    }
  });
}
  
cancelAppointment(appointment: any) {
  console.log('🔍 Annulation du rendez-vous:', appointment);
  
  // ✅ Vérifier si on peut annuler
  if (!this.canCancel(appointment)) {
    if (appointment.isPaid) {
      alert('Impossible d\'annuler un rendez-vous déjà payé');
    } else if (appointment.isExpired) {
      alert('Impossible d\'annuler un rendez-vous expiré');
    }
    return;
  }
  
  if (!confirm(`Êtes-vous sûr de vouloir annuler ce rendez-vous avec ${appointment.patientName} ?`)) {
    return;
  }

  const patientId = appointment.patientId || appointment.patient?.id;
  
  if (!patientId) {
    console.error('Patient ID introuvable');
    this.showToast('Erreur: impossible d\'identifier le patient', 'error');
    return;
  }

  console.log('📤 Envoi de la demande d\'annulation pour appointment ID:', appointment.id);
  
  this.appointmentService.deleteAppointment(appointment.id).subscribe({
    next: () => {
      console.log('✅ Rendez-vous annulé avec succès');
      
      // ✅ Formater la date pour la notification
      const formattedDate = this.formatDisplayDate(appointment.startTime);
      const formattedTime = this.formatDisplayTime(appointment.startTime);
      
      const notificationMessage = `Votre rendez-vous "${appointment.title}" du ${formattedDate} à ${formattedTime} a été annulé par le médecin.\n\n` +
        `❌ Rendez-vous annulé\n\n` +
        `📝 Détails:\n` +
        `• Titre: ${appointment.title}\n` +
        `• Date: ${formattedDate}\n` +
        `• Heure: ${formattedTime}\n` +
        `• Tarif: ${appointment.fee} TND\n\n` +
        `Si vous avez déjà payé, le remboursement sera effectué sous 48h.\n\n` +
        `Vous pouvez prendre un nouveau rendez-vous depuis votre espace patient.`;
      
      this.notificationService.sendNotification(
        patientId,  
        '❌ Rendez-vous annulé',
        notificationMessage,
        '/patient/appointments'
      ).subscribe({
        next: () => {
          console.log('✅ Notification d\'annulation envoyée');
          this.showToast('Notification envoyée au patient', 'success');
        },
        error: (err) => {
          console.error('Erreur notification:', err);
          this.showToast('Erreur lors de l\'envoi de la notification', 'error');
        }
      });

      this.loadAppointments();
      this.showToast('Rendez-vous annulé avec succès', 'success');
    },
    error: (err) => {
      console.error('❌ Erreur annulation:', err);
      this.showToast('Erreur lors de l\'annulation: ' + (err.error?.message || err.message), 'error');
    }
  });
}

  viewPatientProfile(patientId: number) {
    this.router.navigate(['/doctor/patient', patientId]);
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatTimeForInput(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateDuration(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return (endDate.getTime() - startDate.getTime()) / (1000 * 60);
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

  goBack() {
    this.router.navigate(['/doctor/dashboard']);
  }
}