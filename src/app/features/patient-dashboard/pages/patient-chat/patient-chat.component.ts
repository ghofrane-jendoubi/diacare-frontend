// patient-chat.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
// ✅ Importer depuis chatnutrition.service uniquement
import { ChatNutritionService, ChatMessage } from '../../../../services/chatnutrition.service';
import { AuthService } from '../../../../core/services/auth.service';

// ✅ Ne pas importer ChatMessage depuis diet-plan.model
// Supprimer: import { ChatMessage } from '../../../../models/diet-plan.model';

@Component({
  selector: 'app-patient-chat',
  templateUrl: './patient-chat.component.html',
  styleUrls: ['./patient-chat.component.css']
})
export class PatientChatComponent implements OnInit, OnDestroy {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  patientId: number | null = null;
  nutritionistId: number | null = null;
  nutritionistName: string = '';
  unreadCount: number = 0;

  messages: ChatMessage[] = [];
  newMessage = '';
  isSending = false;
  isLoading = true;
  errorMessage = '';

  quickReplies = [
    'Bonjour, j\'ai une question sur mon alimentation',
    'Quels aliments éviter ?',
    'Puis-je manger des fruits ?',
    'Comment équilibrer mes repas ?',
    'Merci pour votre aide !'
  ];

  private pollSub?: Subscription;

  constructor(
    private chatService: ChatNutritionService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const user = this.authService.getCurrentUser();
    if (user) {
      this.patientId = user.id;
    } else {
      this.router.navigate(['/auth/patient']);
      return;
    }

    this.route.params.subscribe(params => {
      this.nutritionistId = +params['id'];

      if (!this.nutritionistId) {
        this.errorMessage = 'Nutritionniste non trouvé';
        this.isLoading = false;
        return;
      }

      localStorage.setItem('selected_nutritionist_id', this.nutritionistId.toString());

      this.loadNutritionistInfo();
      this.loadMessages();
      this.startPolling();
      this.loadUnreadCount();
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  loadNutritionistInfo(): void {
    const name = localStorage.getItem('selected_nutritionist_name');
    this.nutritionistName = name || `Nutritionniste #${this.nutritionistId}`;
  }

  loadMessages(): void {
    if (!this.patientId || !this.nutritionistId) return;

    this.isLoading = true;
    this.chatService.getMessagesWithNutritionist(this.patientId, this.nutritionistId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.isLoading = false;
        this.scrollToBottom();
        this.markAsRead();
      },
      error: (err) => {
        console.error('Erreur chargement messages:', err);
        this.isLoading = false;
        this.errorMessage = 'Erreur de chargement des messages';
      }
    });
  }

  loadUnreadCount(): void {
    if (!this.patientId) return;
    this.chatService.countUnread(this.patientId).subscribe({
      next: (count) => this.unreadCount = count,
      error: () => this.unreadCount = 0
    });
  }

  startPolling(): void {
    if (!this.patientId || !this.nutritionistId) return;

    this.pollSub = interval(5000).pipe(
      switchMap(() => this.chatService.getMessagesWithNutritionist(this.patientId!, this.nutritionistId!))
    ).subscribe({
      next: (msgs) => {
        if (msgs.length !== this.messages.length) {
          this.messages = msgs;
          this.scrollToBottom();
          this.markAsRead();
          this.loadUnreadCount();
        }
      },
      error: (err) => console.error('Erreur polling:', err)
    });
  }

  markAsRead(): void {
    if (!this.patientId || !this.nutritionistId) return;
    this.chatService.markAsRead(this.patientId, this.nutritionistId).subscribe();
  }

  send(): void {
  if (!this.newMessage.trim() || this.isSending) return;
  if (!this.patientId || !this.nutritionistId) return;

  this.isSending = true;

  console.log('📤 Envoi message - Patient:', this.patientId, 'Nutritionniste:', this.nutritionistId);

  this.chatService.sendMessage({
    content: this.newMessage.trim(),
    senderId: this.patientId,        
    senderRole: 'patient',
    receiverId: this.nutritionistId, 
    receiverRole: 'nutritionist',
    patientId: this.patientId        
  }).subscribe({
    next: (msg) => {
      this.messages.push(msg);
      this.newMessage = '';
      this.isSending = false;
      this.scrollToBottom();
    },
    error: (err) => {
      console.error('Erreur envoi:', err);
      this.isSending = false;
    }
  });
}

  useQuickReply(reply: string): void {
    this.newMessage = reply;
    this.send();
  }

  isOwn(msg: ChatMessage): boolean {
    return msg.senderRole === 'patient';
  }

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

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' });
  }

  showDateSeparator(i: number): boolean {
    if (i === 0) return true;
    const currentDate = this.messages[i]?.createdAt;
    const previousDate = this.messages[i-1]?.createdAt;
    if (!currentDate || !previousDate) return false;
    return new Date(currentDate).toDateString() !== new Date(previousDate).toDateString();
  }

  goBack(): void {
    this.router.navigate(['/patient/nutritionists']);
  }
}