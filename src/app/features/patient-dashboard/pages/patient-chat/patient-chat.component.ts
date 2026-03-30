import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ChatNutritionService } from '../../../../services/chatnutrition.service';
import { ChatMessage } from '../../../../models/diet-plan.model';

@Component({
  selector: 'app-patient-chat',
  templateUrl: './patient-chat.component.html',
  styleUrls: ['./patient-chat.component.css']
})
export class PatientChatComponent implements OnInit, OnDestroy {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  // Phase 1 : hardcodé — Phase 2 : depuis AuthService collègue
  patientId:      number = 1;
  nutritionistId: number = 1;

  messages:   ChatMessage[] = [];
  newMessage  = '';
  isSending   = false;
  isLoading   = true;
  unreadCount = 0;

  quickReplies = [
    '👍 Merci pour le conseil !',
    '❓ J\'ai une question sur mon plan.',
    '😔 J\'ai du mal à respecter le régime.',
    '✅ J\'ai suivi le plan aujourd\'hui.',
    '📸 Je vais envoyer une photo de mon repas.',
  ];

  private pollSub?: Subscription;

  constructor(
    private chatService: ChatNutritionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadMessages();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  loadMessages(): void {
    this.isLoading = true;
    this.chatService.getConversation(this.patientId).subscribe({
      next: (msgs) => {
        this.messages    = msgs;
        this.unreadCount = msgs.filter(m => m.senderRole === 'nutritionist' && !m.isRead).length;
        this.isLoading   = false;
        this.scrollToBottom();
        this.chatService.markAsRead(this.patientId, this.patientId).subscribe();
      },
      error: () => { this.isLoading = false; }
    });
  }

  startPolling(): void {
    this.pollSub = interval(5000).pipe(
      switchMap(() => this.chatService.getConversation(this.patientId))
    ).subscribe({
      next: (msgs) => {
        if (msgs.length !== this.messages.length) {
          this.messages    = msgs;
          this.unreadCount = msgs.filter(m => m.senderRole === 'nutritionist' && !m.isRead).length;
          this.scrollToBottom();
          this.chatService.markAsRead(this.patientId, this.patientId).subscribe();
        }
      }
    });
  }

  send(): void {
    if (!this.newMessage.trim() || this.isSending) return;
    this.isSending = true;

    this.chatService.sendMessage({
      content:      this.newMessage.trim(),
      senderId:     this.patientId,
      senderRole:   'patient',
      receiverId:   this.nutritionistId,
      receiverRole: 'nutritionist',
      patientId:    this.patientId
    }).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.newMessage = '';
        this.isSending  = false;
        this.scrollToBottom();
      },
      error: () => { this.isSending = false; }
    });
  }

  useQuickReply(reply: string): void { this.newMessage = reply; }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }

  isOwn(msg: ChatMessage): boolean {
    return msg.senderRole === 'patient';
  }

  formatTime(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' });
  }

  showDateSeparator(i: number): boolean {
    if (i === 0) return true;
    const curr = new Date(this.messages[i].createdAt     || '').toDateString();
    const prev = new Date(this.messages[i - 1].createdAt || '').toDateString();
    return curr !== prev;
  }
}