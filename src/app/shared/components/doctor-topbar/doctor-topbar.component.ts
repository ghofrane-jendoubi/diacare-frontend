import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { MessageService } from '../../../services/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-doctor-topbar',
  templateUrl: './doctor-topbar.component.html',
  styleUrls: ['./doctor-topbar.component.css']
})
export class DoctorTopbarComponent implements OnInit, OnDestroy {
  isScrolled = false;
  searchTerm = '';
  
  // Doctor info
  doctorId: number | null = null;
  doctorName: string = 'Dr. Ahmed Benani';
  doctorSpecialty: string = 'Endocrinologue';
  doctorEmail: string = '';
  doctorInitials: string = 'AB';
  
  // Notifications
  notifications: any[] = [];
  unreadCount: number = 0;
  showNotifications = false;
  
  // Messages
  recentMessages: any[] = [];
  unreadMessagesCount: number = 0;
  showMessages = false;
  
  // Profile dropdown
  showProfile = false;
  
  // Polling subscription
  private pollingSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadDoctorInfo();
    this.loadNotifications();
    this.loadRecentMessages();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadDoctorInfo(): void {
    const doctorIdStr = localStorage.getItem('doctor_id');
    const firstName = localStorage.getItem('doctor_firstName');
    const lastName = localStorage.getItem('doctor_lastName');
    const email = localStorage.getItem('doctor_email');
    const speciality = localStorage.getItem('doctor_speciality');
    
    if (doctorIdStr) {
      this.doctorId = parseInt(doctorIdStr);
    }
    
    if (firstName && lastName) {
      this.doctorName = `Dr. ${firstName} ${lastName}`;
      this.doctorInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
    }
    
    if (email) {
      this.doctorEmail = email;
    }
    
    if (speciality) {
      this.doctorSpecialty = this.getSpecialityLabel(speciality);
    }
  }

  loadNotifications(): void {
    if (!this.doctorId) return;
    
    this.notificationService.getUnreadNotifications(this.doctorId).subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.length;
      },
      error: (err) => console.error('Erreur chargement notifications:', err)
    });
  }

  loadRecentMessages(): void {
    if (!this.doctorId) return;
    
    this.messageService.getDoctorConversations(this.doctorId).subscribe({
      next: (data) => {
        this.recentMessages = data.slice(0, 5).map(conv => ({
          patientId: conv.patientId,
          patientName: conv.patientName,
          lastMessage: conv.lastMessage || 'Aucun message',
          time: this.formatRelativeTime(conv.lastMessageTime),
          unread: conv.unreadCount > 0
        }));
        this.unreadMessagesCount = data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      },
      error: (err) => console.error('Erreur chargement messages:', err)
    });
  }

  startPolling(): void {
    if (!this.doctorId) return;
    
    this.pollingSubscription = this.notificationService.startPolling(this.doctorId).subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: (err) => console.error('Erreur polling:', err)
    });
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/doctor/patients'], { queryParams: { search: this.searchTerm } });
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showMessages = false;
    this.showProfile = false;
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  toggleMessages(): void {
    this.showMessages = !this.showMessages;
    this.showNotifications = false;
    this.showProfile = false;
    if (this.showMessages) {
      this.loadRecentMessages();
    }
  }

  toggleProfile(): void {
    this.showProfile = !this.showProfile;
    this.showNotifications = false;
    this.showMessages = false;
  }

  markAllAsRead(): void {
    if (!this.doctorId) return;
    
    this.notificationService.markAllAsRead(this.doctorId).subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: (err) => console.error('Erreur marquage:', err)
    });
  }

  openNotification(notification: any): void {
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        this.showNotifications = false;
        if (notification.link) {
          this.router.navigate([notification.link]);
        }
      }
    });
  }

  openChat(message: any): void {
    this.showMessages = false;
    this.router.navigate(['/doctor/chat', message.patientId]);
  }

  logout(): void {
    localStorage.removeItem('doctor_id');
    localStorage.removeItem('doctor_email');
    localStorage.removeItem('doctor_firstName');
    localStorage.removeItem('doctor_lastName');
    localStorage.removeItem('doctor_role');
    localStorage.removeItem('certificate_status');
    this.router.navigate(['/doctor/login']);
  }

  getNotificationIcon(title: string): string {
    if (title?.includes('Rendez-vous')) return 'bi-calendar-check';
    if (title?.includes('Résultat')) return 'bi-file-medical';
    if (title?.includes('Rappel')) return 'bi-alarm';
    if (title?.includes('Paiement')) return 'bi-credit-card';
    return 'bi-bell';
  }

  getIconClass(type: string): string {
    switch(type) {
      case 'appointment': return 'appointment';
      case 'result': return 'result';
      case 'reminder': return 'reminder';
      default: return '';
    }
  }

  getSpecialityLabel(speciality: string): string {
    const labels: any = {
      'ENDOCRINOLOGUE': 'Endocrinologue',
      'DIABETOLOGUE': 'Diabétologue',
      'CARDIOLOGUE': 'Cardiologue',
      'GENERALISTE': 'Médecin généraliste',
      'OPHTALMOLOGISTE': 'Ophtalmologiste',
      'NEPHROLOGUE': 'Néphrologue',
      'PODOLOGUE': 'Podologue',
      'NEUROLOGUE': 'Neurologue',
      'PEDIATRE': 'Pédiatre'
    };
    return labels[speciality] || speciality;
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
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    return `${diffDays} j`;
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.action-dropdown') && !target.closest('.profile-dropdown')) {
      this.showNotifications = false;
      this.showMessages = false;
      this.showProfile = false;
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const searchInput = document.querySelector('.search-input') as HTMLInputElement;
      searchInput?.focus();
    }
  }
}