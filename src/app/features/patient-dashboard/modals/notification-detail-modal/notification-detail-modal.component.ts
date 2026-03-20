import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-notification-detail-modal',
  templateUrl: './notification-detail-modal.component.html',
  styleUrls: ['./notification-detail-modal.component.css']
})
export class NotificationDetailModalComponent {
  @Input() notification: any;
  @Output() closeModal = new EventEmitter<void>();
  @Output() payAppointment = new EventEmitter<any>();

  close() {
    this.closeModal.emit();
  }

  onPay() {
    this.payAppointment.emit(this.notification);
    alert('Fonctionnalité de paiement à venir');
    this.closeModal.emit();
  }

  formatFullDate(date: string): string {
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

  extractAppointmentInfo(message: string): any {
    // Extraire les informations du rendez-vous du message
    const timeMatch = message.match(/(\d{2}\/\d{2}\/\d{4}) à (\d{2}:\d{2})/);
    return {
      date: timeMatch ? timeMatch[1] : 'Date non spécifiée',
      time: timeMatch ? timeMatch[2] : 'Heure non spécifiée'
    };
  }
  getIcon(title: string): string {
  if (title.includes('Rendez-vous')) return 'bi-calendar-check';
  if (title.includes('Résultat')) return 'bi-file-medical';
  if (title.includes('Rappel')) return 'bi-alarm';
  return 'bi-bell';
}
}