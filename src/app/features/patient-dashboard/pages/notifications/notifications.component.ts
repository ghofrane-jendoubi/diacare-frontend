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

  // Pour le modal de détail
  showDetailModal = false;
  selectedNotification: any = null;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllNotifications();
  }

  loadAllNotifications(): void {
    this.loading = true;
    const userId = 1; // ID du patient connecté
    this.notificationService.getUserNotifications(userId).subscribe({
      next: (data: any[]) => {
        this.notifications = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement notifications:', err);
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
      filtered = filtered.filter(n => n.title.includes('Rendez-vous'));
    } else if (this.filterType === 'results') {
      filtered = filtered.filter(n => n.title.includes('Résultat'));
    }

    // Filtrer par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(term) ||
        n.message.toLowerCase().includes(term)
      );
    }

    this.filteredNotifications = filtered;
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
      },
      error: (err) => console.error('Erreur marquage:', err)
    });
  }
  // Ajouter cette méthode pour remplacer notifications.some()
hasUnreadNotifications(): boolean {
  return this.notifications.some(n => !n.read);
}

  markAllAsRead(): void {
    const userId = 1;
    this.notificationService.markAllAsRead(userId).subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.applyFilter();
      },
      error: (err) => console.error('Erreur marquage toutes:', err)
    });
  }

  openNotificationDetail(notification: any): void {
    this.selectedNotification = notification;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedNotification = null;
  }

  onPay(notification: any): void {
    console.log('Paiement pour:', notification);
    // Rediriger vers la page de paiement plus tard
  }

  formatDate(date: string): string {
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
    if (title.includes('Rendez-vous')) return 'bi-calendar-check';
    if (title.includes('Résultat')) return 'bi-file-medical';
    if (title.includes('Rappel')) return 'bi-alarm';
    return 'bi-bell';
  }

  getBadgeClass(title: string): string {
    if (title.includes('Rendez-vous')) return 'badge-appointment';
    if (title.includes('Résultat')) return 'badge-result';
    if (title.includes('Rappel')) return 'badge-reminder';
    return 'badge-default';
  }

  goBack() {
    this.router.navigate(['/patient']);
  }
}