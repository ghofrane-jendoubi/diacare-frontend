import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
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

  quickReplies = [
    'Ma glycémie est élevée',
    'Que manger avec le diabète ?',
    'Comment gérer une hypoglycémie ?',
    'Mes médicaments',
    'Activité physique'
  ];

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit() {
    this.addWelcomeMessage();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  addWelcomeMessage() {
    this.messages.push({
      sender: 'BOT',
      message: '👋 Bonjour ! Je suis DiaCare Assistant.\n\nJe suis là pour vous aider avec vos questions sur le diabète.\n\nComment puis-je vous aider aujourd\'hui ?',
      createdAt: new Date().toISOString()
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendQuickReply(reply: string) {
    this.userMessage = reply;
    this.sendMessage();
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;

    const msg = this.userMessage.trim();
    this.userMessage = '';

    this.messages.push({
      sender: 'PATIENT',
      message: msg,
      createdAt: new Date().toISOString()
    });

    this.isTyping = true;

    this.chatbotService.sendMessage(msg).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.isTyping = false;
          this.messages.push({
            sender: 'BOT',
            message: res.response,
            createdAt: new Date().toISOString()
          });
        }, 800);
      },
      error: () => {
        this.isTyping = false;
        this.messages.push({
          sender: 'BOT',
          message: '❌ Désolé, je rencontre un problème de connexion. Veuillez réessayer.',
          createdAt: new Date().toISOString()
        });
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
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch {}
  }

  clearChat() {
    this.messages = [];
    this.addWelcomeMessage();
  }

  formatMessage(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  timeAgo(dateStr?: string): string {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  }
}