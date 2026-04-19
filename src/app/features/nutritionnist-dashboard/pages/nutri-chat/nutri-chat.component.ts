// nutri-chat.component.ts
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
// ✅ Importer depuis chatnutrition.service UNIQUEMENT
import { ChatNutritionService, ChatMessage } from '../../../../services/chatnutrition.service';
// ❌ Supprimer l'import depuis diet-plan.model
// import { ChatMessage } from '../../../../models/diet-plan.model';

@Component({
  selector: 'app-nutri-chat',
  templateUrl: './nutri-chat.component.html',
  styleUrls: ['./nutri-chat.component.css']
})
export class NutriChatComponent implements OnInit, OnDestroy {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  nutritionistId: number | null = null;
  patientId: number | null = null;
  patientName: string = '';
  nutritionistName: string = '';

  messages: ChatMessage[] = [];
  newMessage = '';
  isSending = false;
  isLoading = true;
  errorMessage = '';

  quickReplies = [
    '✅ Excellent suivi, continuez ainsi !',
    '⚠️ Réduisez les glucides rapides ce soir.',
    '🥗 Pensez à ajouter plus de légumes verts.',
    '💧 Buvez au moins 1.5L d\'eau aujourd\'hui.',
    '📋 Votre plan alimentaire a été mis à jour.',
  ];

  private pollSub?: Subscription;

  constructor(
    private chatService: ChatNutritionService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loadNutritionistInfo();

    this.route.params.subscribe(params => {
      const patientIdFromUrl = params['id'];
      
      if (patientIdFromUrl) {
        this.patientId = +patientIdFromUrl;
        this.loadPatientInfo();
        this.loadMessages();
        this.startPolling();
      } else {
        console.error('❌ Aucun patient sélectionné');
        this.errorMessage = 'Patient non trouvé';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  loadNutritionistInfo(): void {
    const nutritionistIdStr = localStorage.getItem('nutritionist_id');
    const firstName = localStorage.getItem('nutritionist_firstName');
    const lastName = localStorage.getItem('nutritionist_lastName');
    
    if (nutritionistIdStr) {
      this.nutritionistId = parseInt(nutritionistIdStr);
      console.log('✅ Nutritionniste connecté ID:', this.nutritionistId);
      
      if (firstName && lastName) {
        this.nutritionistName = `${firstName} ${lastName}`;
      } else if (firstName) {
        this.nutritionistName = firstName;
      } else {
        this.nutritionistName = 'Nutritionniste';
      }
    } else {
      console.error('❌ Aucun nutritionniste connecté');
      this.errorMessage = 'Veuillez vous connecter';
      setTimeout(() => {
        this.router.navigate(['/auth/nutritionist']);
      }, 2000);
    }
  }

  loadPatientInfo(): void {
    const patientId = this.patientId;
    if (!patientId) return;
    
    this.chatService.getPatientInfo(patientId).subscribe({
      next: (patient) => {
        this.patientName = `${patient.firstName} ${patient.lastName}`;
        console.log('✅ Infos patient chargées:', this.patientName);
      },
      error: (err) => {
        console.error('❌ Erreur chargement infos patient:', err);
        this.patientName = `Patient #${patientId}`;
      }
    });
  }

  loadMessages(): void {
    const patientId = this.patientId;
    if (!patientId) {
      console.error('❌ Patient ID manquant');
      return;
    }
    
    this.isLoading = true;
    // ✅ Utiliser la méthode correcte avec les deux IDs
    this.chatService.getNutritionistMessagesWithPatient(this.nutritionistId!, patientId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.isLoading = false;
        this.scrollToBottom();
        this.markMessagesAsRead();
      },
      error: (err) => {
        console.error('❌ Erreur chargement messages:', err);
        this.isLoading = false;
        this.errorMessage = 'Erreur de chargement des messages';
      }
    });
  }

  startPolling(): void {
    const patientId = this.patientId;
    if (!patientId || !this.nutritionistId) return;
    
    this.pollSub = interval(5000).pipe(
      switchMap(() => this.chatService.getNutritionistMessagesWithPatient(this.nutritionistId!, patientId))
    ).subscribe({
      next: (msgs) => {
        if (msgs.length !== this.messages.length) {
          this.messages = msgs;
          this.scrollToBottom();
          this.markMessagesAsRead();
        }
      },
      error: (err) => console.error('❌ Erreur polling:', err)
    });
  }

  markMessagesAsRead(): void {
    const patientId = this.patientId;
    const nutritionistId = this.nutritionistId;
    
    if (!patientId || !nutritionistId) return;
    
    this.chatService.markAsRead(patientId, nutritionistId).subscribe({
      error: (err) => console.error('❌ Erreur marquage lu:', err)
    });
  }

  // nutri-chat.component.ts
send(): void {
  if (!this.newMessage.trim() || this.isSending) return;
  if (!this.patientId || !this.nutritionistId) return;

  this.isSending = true;

  console.log('📤 Envoi message - Nutritionniste:', this.nutritionistId, 'Patient:', this.patientId);

  this.chatService.sendMessage({
    content: this.newMessage.trim(),
    senderId: this.nutritionistId,  
    senderRole: 'nutritionist',
    receiverId: this.patientId,       
    receiverRole: 'patient',
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

  isOwn(msg: ChatMessage): boolean {
    return msg.senderRole === 'nutritionist';
  }

  formatTime(d: string | undefined): string {
    if (!d) return '';
    try {
      return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  formatDate(d: string | undefined): string {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' });
    } catch {
      return '';
    }
  }

  showDateSeparator(i: number): boolean {
    if (i === 0) return true;
    const currentDate = this.messages[i]?.createdAt;
    const previousDate = this.messages[i - 1]?.createdAt;
    
    if (!currentDate || !previousDate) return false;
    
    try {
      const curr = new Date(currentDate).toDateString();
      const prev = new Date(previousDate).toDateString();
      return curr !== prev;
    } catch {
      return false;
    }
  }

  goBack(): void {
    this.router.navigate(['/nutritionnist/patients']);
  }
}