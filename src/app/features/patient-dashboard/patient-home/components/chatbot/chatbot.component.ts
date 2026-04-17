import { Component, OnInit, ViewChild, ElementRef,
         AfterViewChecked } from '@angular/core';
import { ChatbotService, ChatMessage } from '../../services/chatbot.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isOpen = false;
  isTyping = false;
  userMessage = '';
  messages: ChatMessage[] = [];
  shouldScroll = false;

  quickReplies = [
    '🩸 Ma glycémie est élevée',
    '🥗 Que manger avec le diabète ?',
    '⬇️ Comment gérer une hypoglycémie ?',
    '💊 Mes médicaments',
    '🏃 Activité physique et diabète'
  ];

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit() {
    this.addWelcomeMessage();
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  addWelcomeMessage() {
    this.messages.push({
      sender: 'BOT',
      message: '👋 Bonjour ! Je suis **DiaCare Assistant**, votre guide IA pour la gestion du diabète.\n\nPosez-moi n\'importe quelle question sur le diabète !',
      createdAt: new Date().toISOString()
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.shouldScroll = true;
    }
  }

  sendQuickReply(reply: string) {
    // Nettoyer les emojis du texte envoyé
    this.userMessage = reply.replace(/[🩸🥗⬇️💊🏃]/gu, '').trim();
    this.sendMessage();
  }

  sendMessage() {
    if (!this.userMessage.trim() || this.isTyping) return;

    const msg = this.userMessage.trim();
    this.userMessage = '';

    this.messages.push({
      sender: 'PATIENT',
      message: msg,
      createdAt: new Date().toISOString()
    });

    this.isTyping = true;
    this.shouldScroll = true;

    this.chatbotService.sendMessage(msg).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.isTyping = false;
          this.messages.push({
            sender: 'BOT',
            message: res.response,
            createdAt: new Date().toISOString()
          });
          this.shouldScroll = true;
        }, 600);
      },
      error: () => {
        this.isTyping = false;
        this.messages.push({
          sender: 'BOT',
          message: '❌ Désolé, connexion impossible. Veuillez réessayer.',
          createdAt: new Date().toISOString()
        });
        this.shouldScroll = true;
      }
    });
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom() {
    try {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }

  clearChat() {
    this.chatbotService.resetSession();
    this.messages = [];
    this.addWelcomeMessage();
  }

  formatMessage(text: string): string {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }
}