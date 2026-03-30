import { Component, OnInit } from '@angular/core';
import { DoctorEducationService } from '../../services/doctor-education.service';
import { PrivateMessage } from '../../models/doctor-education.model';

@Component({
  selector: 'app-messages-inbox',
  templateUrl: './messages-inbox.component.html',
  styleUrls: ['./messages-inbox.component.css']
})
export class MessagesInboxComponent implements OnInit {

  messages: PrivateMessage[] = [];
  selectedMessage: PrivateMessage | null = null;
  replyText = '';
  isLoading = true;
  isDeleting = false;

  constructor(private doctorService: DoctorEducationService) {}

  ngOnInit() { this.loadMessages(); }

  loadMessages() {
    this.isLoading = true;
    this.doctorService.getReceivedMessages().subscribe({
      next: (data) => { this.messages = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  openMessage(msg: PrivateMessage) {
    this.selectedMessage = msg;
    if (!msg.isRead) {
      this.doctorService.markMessageAsRead(msg.id).subscribe(() => {
        msg.isRead = true;
      });
    }
  }

  sendReply() {
    if (!this.replyText.trim() || !this.selectedMessage) return;
    this.doctorService.sendPrivateMessage(
      this.selectedMessage.senderId,
      this.selectedMessage.senderName,
      this.replyText
    ).subscribe(() => {
      alert('Réponse envoyée !');
      this.replyText = '';
    });
  }

  get unreadCount(): number {
    return this.messages.filter(m => !m.isRead).length;
  }

  timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return new Date(dateStr).toLocaleDateString('fr');
  }

  deleteMessage() {
    if (!this.selectedMessage) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      this.isDeleting = true;
      this.doctorService.deleteMessage(this.selectedMessage.id).subscribe({
        next: () => {
          this.messages = this.messages.filter(m => m.id !== this.selectedMessage!.id);
          this.selectedMessage = null;
          this.isDeleting = false;
          alert('Message supprimé avec succès');
        },
        error: () => {
          this.isDeleting = false;
          alert('Erreur lors de la suppression du message');
        }
      });
    }
  }
}