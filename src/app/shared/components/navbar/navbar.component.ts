import { Component, Input, HostListener, OnInit, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() menuItems: any[] = [];
  @Input() isLoggedIn: boolean = false;
  @Input() userId: number = 1;
  @Input() userName: string = 'Sophie Martin';
  @Input() userEmail: string = 'sophie.m@example.com';
  

  isScrolled = false;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  showNotifications = false;
  activeSection: string = '';

  // Notifications
  notifications: any[] = [];
  unreadCount: number = 0;
  private pollingSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (this.isLoggedIn) {
      // Charger depuis le localStorage d'abord
      this.loadNotificationsFromStorage();
      // Puis charger depuis le serveur
      this.loadNotifications();
      this.startPolling();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  get userInitials(): string {
    return this.userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  // ===== GESTION DU STOCKAGE LOCAL =====

  loadNotificationsFromStorage(): void {
    const stored = localStorage.getItem(`notifications_${this.userId}`);
    if (stored) {
      const data = JSON.parse(stored);
      this.notifications = data.notifications || [];
      this.unreadCount = data.unreadCount || 0;
    }
  }

  saveNotificationsToStorage(): void {
    const data = {
      notifications: this.notifications,
      unreadCount: this.unreadCount,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(`notifications_${this.userId}`, JSON.stringify(data));
  }

  // ===== GESTION DES NOTIFICATIONS =====

  loadNotifications(): void {
    this.notificationService.getUnreadNotifications(this.userId).subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.length;
        this.saveNotificationsToStorage();
      },
      error: (err) => console.error('Erreur chargement notifications:', err)
    });
  }

  startPolling(): void {
    this.pollingSubscription = this.notificationService.startPolling(this.userId).subscribe({
      next: (count) => {
        this.unreadCount = count;
        if (count > 0) {
          this.loadNotifications();
        }
      },
      error: (err) => console.error('Erreur polling notifications:', err)
    });
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  markAsRead(notificationId: number, event?: Event): void {
  if (event) {
    event.stopPropagation();
  }
  this.notificationService.markAsRead(notificationId).subscribe({
    next: () => {
      // Recharger les notifications après marquage
      this.loadNotifications();
    },
    error: (err) => console.error('Erreur marquage notification:', err)
  });
}

  markAllAsRead(): void {
    this.notificationService.markAllAsRead(this.userId).subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: (err) => console.error('Erreur marquage toutes:', err)
    });
  }

  openNotification(notification: any): void {
  this.markAsRead(notification.id);
  
  // Déterminer le chemin en fonction du rôle de l'utilisateur
  let route = notification.link || '/';
  
  // Si c'est un patient 
  if (this.userId < 10) {  
    if (route === '/appointments' || route === 'appointments') {
      route = '/patient/appointments';
    } else if (route.startsWith('/')) {
      route = `/patient${route}`;
    } else {
      route = `/patient/${route}`;
    }
  }
  
  console.log('Navigation vers:', route);
  this.router.navigate([route]);
  this.showNotifications = false;
}

  getNotificationIcon(title: string): string {
    const iconMap: { [key: string]: string } = {
      'Nouveau rendez-vous': 'bi-calendar-check',
      'Rappel': 'bi-alarm',
      'Message': 'bi-chat-dots',
      'Résultat': 'bi-file-medical',
      'default': 'bi-bell'
    };
    return iconMap[title] || iconMap['default'];
  }

  formatTime(date: string): string {
    const notifDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return notifDate.toLocaleDateString('fr-FR');
  }

  // ===== GESTION DU MENU =====

  @HostListener('window:scroll', [])
  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  scrollTo(sectionId: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.activeSection = sectionId;
      this.isMobileMenuOpen = false;
    }
  }

  logout() {
    this.isLoggedIn = false;
    this.stopPolling();
    // Nettoyer le localStorage
    localStorage.removeItem(`notifications_${this.userId}`);
    this.router.navigate(['/']);
  }
  closeMobileMenu() {
  this.isMobileMenuOpen = false;
}
}