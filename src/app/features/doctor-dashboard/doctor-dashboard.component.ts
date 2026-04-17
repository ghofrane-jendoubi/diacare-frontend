import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { MessageService } from '../../services/message.service';
import { PatientService } from '../../services/patient.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit, OnDestroy {
  currentDate = new Date();
  doctorId: number | null = null;
  
  // Statistiques
  statistics = [
    { icon: 'bi bi-people-fill', value: '0', label: 'Patients Actifs', bgColor: 'linear-gradient(135deg, #3498db, #2980b9)', trend: 0 },
    { icon: 'bi bi-calendar-check-fill', value: '0', label: 'Rendez-vous Aujourd\'hui', bgColor: 'linear-gradient(135deg, #e74c3c, #c0392b)', trend: 0 },
    { icon: 'bi bi-chat-dots-fill', value: '0', label: 'Messages non lus', bgColor: 'linear-gradient(135deg, #f39c12, #e67e22)', trend: 0 },
    { icon: 'bi bi-file-medical-fill', value: '0', label: 'Analyses en attente', bgColor: 'linear-gradient(135deg, #2ecc71, #27ae60)', trend: 0 }
  ];

  // Rendez-vous du jour
  todayAppointments: any[] = [];
  
  // Demandes en ligne (messages récents)
  onlineRequests: any[] = [];
  
  // Analyses en attente
  pendingAnalyses: any[] = [];
  
  // Messages récents
  recentMessages: any[] = [];
  
  // Alertes médicales
  medicalAlerts: any[] = [];
  
  // Données pour le graphique
  weeklyPatients = [0, 0, 0, 0, 0, 0, 0];
  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  maxPatients = 10;
  
  // Refresh interval
  refreshInterval: any;
  
  // Loading states
  loading = {
    appointments: true,
    messages: true,
    stats: true
  };

  constructor(
    private appointmentService: AppointmentService,
    private messageService: MessageService,
    private patientService: PatientService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du médecin connecté
    const doctorIdStr = localStorage.getItem('doctor_id');
    if (doctorIdStr) {
      this.doctorId = parseInt(doctorIdStr);
    } else {
      console.error('Médecin non connecté');
      this.router.navigate(['/doctor/login']);
      return;
    }
    
    this.loadDashboardData();
    
    // Rafraîchir toutes les 30 secondes
    this.refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadDashboardData(): void {
    this.loadTodayAppointments();
    this.loadMessages();
    this.loadStatistics();
    this.loadPendingAnalyses();
  }

  loadTodayAppointments(): void {
    if (!this.doctorId) return;
    
    this.loading.appointments = true;
    this.appointmentService.getDoctorAppointments(this.doctorId).subscribe({
      next: (data) => {
        const today = new Date().toDateString();
        this.todayAppointments = data
          .filter(app => new Date(app.startTime).toDateString() === today)
          .map(app => ({
            id: app.id,
            time: this.formatTime(app.startTime),
            patientName: app.patientName || 'Patient',
            age: this.calculateAge(app.patient?.dateOfBirth),
            type: app.title,
            status: app.status || (app.paid ? 'confirmed' : 'pending'),
            reason: app.description || 'Consultation médicale',
            lastVisit: app.lastVisit || 'Première visite'
          }))
          .sort((a, b) => a.time.localeCompare(b.time));
        
        // Mettre à jour la statistique
        this.statistics[1].value = this.todayAppointments.length.toString();
        this.loading.appointments = false;
      },
      error: (err) => {
        console.error('Erreur chargement rendez-vous:', err);
        this.loading.appointments = false;
      }
    });
  }

  loadMessages(): void {
    if (!this.doctorId) return;
    
    this.loading.messages = true;
    this.messageService.getDoctorConversations(this.doctorId).subscribe({
      next: (data) => {
        // Messages récents (patients qui ont envoyé des messages)
        this.onlineRequests = data.slice(0, 5).map(conv => ({
          patientId: conv.patientId,
          patientName: conv.patientName,
          age: '?',
          reason: conv.lastMessage || 'Nouveau message',
          urgency: conv.unreadCount > 2 ? 'high' : conv.unreadCount > 0 ? 'medium' : 'low',
          time: this.formatRelativeTime(conv.lastMessageTime),
          unreadCount: conv.unreadCount
        }));
        
        // Messages récents pour la section messages
        this.recentMessages = data.slice(0, 3).map(conv => ({
          from: conv.patientName,
          message: conv.lastMessage || 'Aucun message',
          time: this.formatRelativeTime(conv.lastMessageTime),
          unread: conv.unreadCount > 0,
          patientId: conv.patientId
        }));
        
        // Statistique des messages non lus
        const totalUnread = data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        this.statistics[2].value = totalUnread.toString();
        
        this.loading.messages = false;
      },
      error: (err) => {
        console.error('Erreur chargement messages:', err);
        this.loading.messages = false;
      }
    });
  }

  loadStatistics(): void {
    if (!this.doctorId) return;
    
    this.loading.stats = true;
    
    // Charger le nombre de patients
    this.patientService.getDoctorPatients(this.doctorId).subscribe({
      next: (patients) => {
        this.statistics[0].value = patients.length.toString();
        this.loading.stats = false;
      },
      error: (err) => {
        console.error('Erreur chargement patients:', err);
        this.loading.stats = false;
      }
    });
  }

  loadPendingAnalyses(): void {
    // Simulation d'analyses en attente
    // À adapter selon votre backend
    this.pendingAnalyses = [
      {
        patientName: 'En attente',
        type: 'Analyse IA',
        date: new Date(),
        status: 'pending'
      }
    ];
    this.statistics[3].value = this.pendingAnalyses.length.toString();
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatRelativeTime(dateString: string): string {
    if (!dateString) return 'Récemment';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays} jours`;
  }

  calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  refreshData(): void {
    this.loadDashboardData();
    this.showNotification('Données actualisées', 'success');
  }

  startConsultation(appointment: any): void {
    if (appointment.patientId) {
      this.router.navigate(['/doctor/chat', appointment.patientId]);
    }
  }

  viewAnalysis(analysis: any): void {
    // À implémenter selon votre logique
    console.log('Voir analyse:', analysis);
  }

  acceptRequest(request: any): void {
    if (request.patientId) {
      this.router.navigate(['/doctor/chat', request.patientId]);
    }
  }

  viewMessage(message: any): void {
    if (message.patientId) {
      this.router.navigate(['/doctor/chat', message.patientId]);
    }
  }

  handleAlert(alert: any): void {
    if (alert.patientId) {
      this.router.navigate(['/doctor/chat', alert.patientId]);
    }
  }

  goToAppointments(): void {
    this.router.navigate(['/doctor/appointments']);
  }

  goToDoctorAppointments(): void {
    this.router.navigate(['/doctor/doctor_appointments']);
  }

  goToChat(): void {
    this.router.navigate(['/doctor/chat']);
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'confirmed': 'bg-success bg-opacity-10 text-success',
      'pending': 'bg-warning bg-opacity-10 text-warning',
      'urgent': 'bg-danger bg-opacity-10 text-danger',
      'online': 'bg-info bg-opacity-10 text-info',
      'completed': 'bg-success bg-opacity-10 text-success'
    };
    return classes[status] || 'bg-secondary bg-opacity-10 text-secondary';
  }

  getUrgencyBadge(urgency: string): string {
    const classes: any = {
      'high': 'bg-danger text-white',
      'medium': 'bg-warning text-dark',
      'low': 'bg-info text-white'
    };
    return classes[urgency] || 'bg-secondary text-white';
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    const toast = document.createElement('div');
    toast.className = `toast-${type}`;
    toast.innerHTML = `<i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i><span>${message}</span>`;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '9999';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.backgroundColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    toast.style.color = 'white';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}