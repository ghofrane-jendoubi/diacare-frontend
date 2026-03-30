import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientMessagingService } from '../../services/patient-messaging.service';
import { PrivateMessage } from '../../models/patient-messaging.model';

@Component({
  selector: 'app-patient-messaging',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-messaging.component.html',
  styleUrls: ['./patient-messaging.component.css']
})
export class PatientMessagingComponent implements OnInit {
  sentMessages: PrivateMessage[] = [];
  receivedMessages: PrivateMessage[] = [];
  allMessages: PrivateMessage[] = [];
  selectedMessage: PrivateMessage | null = null;
  replyText = '';
  isLoading = false;
  isDeleting = false;
  currentUserId = 1; // ID du patient actuel
  currentUserName = 'Patient DiaCare';

  constructor(private messagingService: PatientMessagingService) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.isLoading = true;
    this.messagingService.getAllMessages(this.currentUserId).subscribe({
      next: (data) => {
        this.sentMessages = data.sent || [];
        this.receivedMessages = data.received || [];
        this.combineMessages();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  combineMessages(): void {
    // Combiner et trier tous les messages par date
    this.allMessages = [...this.sentMessages, ...this.receivedMessages]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  selectMessage(message: PrivateMessage): void {
    this.selectedMessage = message;
    // Marquer comme lu si c'est un message reçu
    if (!message.isRead && message.receiverId === this.currentUserId) {
      this.messagingService.markAsRead(message.id).subscribe(() => {
        message.isRead = true;
      });
    }
  }

  sendReply(): void {
    if (!this.replyText.trim() || !this.selectedMessage) return;

    const receiverId = this.selectedMessage.senderId === this.currentUserId 
      ? this.selectedMessage.receiverId 
      : this.selectedMessage.senderId;
    
    const receiverName = this.selectedMessage.senderId === this.currentUserId 
      ? this.selectedMessage.receiverName 
      : this.selectedMessage.senderName;

    this.messagingService.sendMessage(
      receiverId,
      receiverName,
      this.replyText,
      this.selectedMessage.contentId,
      this.selectedMessage.commentId
    ).subscribe(() => {
      this.replyText = '';
      this.loadMessages(); // Recharger les messages
    });
  }

  isSentByCurrentUser(message: PrivateMessage): boolean {
    return message.senderId === this.currentUserId;
  }

  getMessageType(message: PrivateMessage): string {
    if (this.isSentByCurrentUser(message)) {
      return 'Envoyé';
    } else {
      return 'Reçu';
    }
  }

  getMessageClass(message: PrivateMessage): string {
    const baseClass = 'message-item';
    const sentClass = this.isSentByCurrentUser(message) ? 'sent' : 'received';
    const readClass = message.isRead ? 'read' : 'unread';
    return `${baseClass} ${sentClass} ${readClass}`;
  }

  timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return `il y a ${Math.floor(diff / 86400)} jour(s)`;
  }

  deleteMessage(): void {
    if (!this.selectedMessage) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      this.isDeleting = true;
      this.messagingService.deleteMessage(this.selectedMessage.id).subscribe({
        next: () => {
          this.allMessages = this.allMessages.filter(m => m.id !== this.selectedMessage!.id);
          this.sentMessages = this.sentMessages.filter(m => m.id !== this.selectedMessage!.id);
          this.receivedMessages = this.receivedMessages.filter(m => m.id !== this.selectedMessage!.id);
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
