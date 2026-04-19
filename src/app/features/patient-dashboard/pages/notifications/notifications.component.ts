import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  filteredNotifications: any[] = [];
  loading = true;
  filterType: 'all' | 'unread' | 'appointments' | 'results' = 'all';
  searchTerm = '';
  patientId: number | null = null; // ✅ Ajout de patientId

  // Pour le modal de détail
  showDetailModal = false;
  selectedNotification: any = null;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Récupérer l'ID du patient connecté depuis localStorage
    this.loadPatientInfo();
    this.loadAllNotifications();
  }


loadPatientInfo(): void {
  //  Essayer plusieurs sources possibles
  let patientIdStr = localStorage.getItem('patient_id');
  
  if (!patientIdStr) {
    // Essayer depuis l'objet 'user'
    const user = localStorage.getItem('user');
    if (user) {
      const userObj = JSON.parse(user);
      patientIdStr = userObj.id?.toString();
    }
  }
  
  if (!patientIdStr) {
    // Essayer depuis 'userId'
    patientIdStr = localStorage.getItem('userId');
  }
  
  if (patientIdStr) {
    this.patientId = parseInt(patientIdStr);
    console.log('✅ Patient ID chargé:', this.patientId);
  } else {
    console.error('❌ Patient ID non trouvé');
    console.log('📦 Contenu localStorage:', { ...localStorage });
    this.router.navigate(['/login']);
  }
}
  loadAllNotifications(): void {
    // ✅ Vérifier que patientId existe
    if (!this.patientId) {
      console.error('❌ Patient ID non disponible');
      this.loading = false;
      return;
    }
    
    this.loading = true;
    console.log('🔄 Chargement des notifications pour patient:', this.patientId);
    
    this.notificationService.getUserNotifications(this.patientId).subscribe({
      next: (data: any[]) => {
        console.log(`✅ ${data.length} notifications chargées`);
        this.notifications = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Erreur chargement notifications:', err);
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    let filtered = [...this.notifications];

    // Filtrer par type
    if (this.filterType === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (this.filterType === 'appointments') {
      filtered = filtered.filter(n => n.title && n.title.includes('Rendez-vous'));
    } else if (this.filterType === 'results') {
      filtered = filtered.filter(n => n.title && n.title.includes('Résultat'));
    }

    // Filtrer par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(n => 
        (n.title && n.title.toLowerCase().includes(term)) ||
        (n.message && n.message.toLowerCase().includes(term))
      );
    }

    this.filteredNotifications = filtered;
    console.log(`📊 Filtre appliqué: ${this.filteredNotifications.length} notifications affichées`);
  }

  setFilter(type: 'all' | 'unread' | 'appointments' | 'results'): void {
    this.filterType = type;
    this.applyFilter();
  }

  markAsRead(notification: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (notification.read) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.applyFilter();
        console.log('✅ Notification marquée comme lue');
      },
      error: (err) => console.error('❌ Erreur marquage:', err)
    });
  }

  hasUnreadNotifications(): boolean {
    return this.notifications.some(n => !n.read);
  }

  markAllAsRead(): void {
    if (!this.patientId) {
      console.error('❌ Patient ID non disponible');
      return;
    }
    
    this.notificationService.markAllAsRead(this.patientId).subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.applyFilter();
        console.log('✅ Toutes les notifications marquées comme lues');
      },
      error: (err) => console.error('❌ Erreur marquage toutes:', err)
    });
  }

  openNotificationDetail(notification: any): void {
    this.selectedNotification = notification;
    this.showDetailModal = true;
    
    // ✅ Marquer comme lue si ce n'est pas déjà fait
    if (!notification.read) {
      this.markAsRead(notification);
    }
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedNotification = null;
  }

  onPay(notification: any): void {
    console.log('Paiement pour:', notification);
    // Extraire l'ID du rendez-vous du message
    const appointmentId = this.extractAppointmentId(notification.message);
    if (appointmentId) {
      this.router.navigate(['/patient/appointments', appointmentId, 'pay']);
    } else {
      this.router.navigate(['/patient/appointments']);
    }
  }

  // ✅ Méthode pour extraire l'ID du rendez-vous
  extractAppointmentId(message: string): number | null {
    if (!message) return null;
    const match = message.match(/\/appointments\/(\d+)/);
    if (match) return parseInt(match[1]);
    const hashMatch = message.match(/Rendez-vous\s*#(\d+)/i);
    if (hashMatch) return parseInt(hashMatch[1]);
    return null;
  }

  formatDate(date: string): string {
    if (!date) return '';
    
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return "Aujourd'hui à " + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return "Hier à " + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + 
             " à " + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
  }

  getIcon(title: string): string {
    if (!title) return 'bi-bell';
    if (title.includes('Rendez-vous')) return 'bi-calendar-check';
    if (title.includes('Résultat')) return 'bi-file-medical';
    if (title.includes('Rappel')) return 'bi-alarm';
    if (title.includes('Paiement')) return 'bi-credit-card';
    return 'bi-bell';
  }

  getBadgeClass(title: string): string {
    if (!title) return 'badge-default';
    if (title.includes('Rendez-vous')) return 'badge-appointment';
    if (title.includes('Résultat')) return 'badge-result';
    if (title.includes('Rappel')) return 'badge-reminder';
    if (title.includes('Paiement')) return 'badge-payment';
    return 'badge-default';
  }

  goBack() {
    this.router.navigate(['/patient']);
  }

  // ✅ Méthode pour rafraîchir les notifications
  refreshNotifications(): void {
    this.loadAllNotifications();
  }
  getUnreadCount(): number {
  return this.notifications.filter(n => !n.read).length;
}
}