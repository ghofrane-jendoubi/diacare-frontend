import { Component, Input, HostListener, OnInit, OnDestroy } from '@angular/core';
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
  @Input() userId: number | null = null;
  @Input() userName: string = '';
  @Input() userEmail: string = '';

  patientId: number | null = null;

  isScrolled = false;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  showNotifications = false;
  activeSection: string = '';

  notifications: any[] = [];
  unreadCount: number = 0;
  private pollingSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    if (this.isLoggedIn && this.userId) {
      this.loadNotificationsFromStorage();
      this.loadNotifications();
      this.startPolling();
    }
  }

  loadUserInfo(): void {
    const patientIdStr = localStorage.getItem('patient_id');
    if (patientIdStr) {
      this.patientId = parseInt(patientIdStr);
      this.userId = this.patientId;
    }
    const firstName = localStorage.getItem('patient_firstName');
    const lastName = localStorage.getItem('patient_lastName');
    if (firstName && lastName) {
      this.userName = `${firstName} ${lastName}`;
    } else if (firstName) {
      this.userName = firstName;
    } else {
      this.userName = 'Patient';
    }
    const email = localStorage.getItem('patient_email');
    if (email) this.userEmail = email;
    if (this.userId) this.isLoggedIn = true;
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  get userInitials(): string {
    if (!this.userName) return 'P';
    return this.userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // ===== STORAGE =====

  loadNotificationsFromStorage(): void {
    if (!this.userId) return;
    const stored = localStorage.getItem(`notifications_${this.userId}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.notifications = data.notifications || [];
        this.unreadCount = data.unreadCount || 0;
      } catch (e) {
        console.error('Erreur parsing localStorage:', e);
      }
    }
  }

  saveNotificationsToStorage(): void {
    if (!this.userId) return;
    const data = {
      notifications: this.notifications,
      unreadCount: this.unreadCount,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(`notifications_${this.userId}`, JSON.stringify(data));
  }

  // ===== NOTIFICATIONS =====

  loadNotifications(): void {
    if (!this.userId) return;
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
    if (!this.userId) return;
    this.pollingSubscription = this.notificationService.startPolling(this.userId).subscribe({
      next: (count) => {
        this.unreadCount = count;
        if (count > 0) this.loadNotifications();
      },
      error: (err) => console.error('Erreur polling:', err)
    });
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.isUserMenuOpen = false;
    if (this.showNotifications) this.loadNotifications();
  }

  markAsRead(notificationId: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => this.loadNotifications(),
      error: (err) => console.error('Erreur marquage:', err)
    });
  }

  markAllAsRead(): void {
    if (!this.userId) return;
    this.notificationService.markAllAsRead(this.userId).subscribe({
      next: () => this.loadNotifications(),
      error: (err) => console.error('Erreur marquage tous:', err)
    });
  }

  openNotification(notification: any): void {
    if (!notification.id) return;
    this.markAsRead(notification.id);
    let route = notification.link || '/';
    if (this.patientId) {
      if (route === '/appointments' || route === 'appointments') route = '/patient/appointments';
      else if (route === '/chat' || route === 'chat') route = '/patient/chat';
      else if (route === '/doctors' || route === 'doctors') route = '/patient/doctors';
      else if (route.startsWith('/')) route = `/patient${route}`;
      else route = `/patient/${route}`;
    }
    this.router.navigate([route]);
    this.showNotifications = false;
  }

  formatTime(date: string): string {
    if (!date) return '';
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

  // ===== MENU =====

  @HostListener('window:scroll', [])
  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) this.isUserMenuOpen = false;
    if (!target.closest('.notifications-wrapper')) this.showNotifications = false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.showNotifications = false;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  scrollTo(sectionId: string, event?: Event) {
    if (event) event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.activeSection = sectionId;
      this.isMobileMenuOpen = false;
    }
  }

  logout() {
    ['patient_id', 'patient_email', 'patient_firstName', 'patient_lastName', 'patient_role'].forEach(k =>
      localStorage.removeItem(k)
    );
    if (this.userId) localStorage.removeItem(`notifications_${this.userId}`);
    this.isLoggedIn = false;
    this.userId = null;
    this.patientId = null;
    this.notifications = [];
    this.unreadCount = 0;
    this.stopPolling();
    this.router.navigate(['/']);
  }
}