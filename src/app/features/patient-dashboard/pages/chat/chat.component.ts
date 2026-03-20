import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from '../../../../services/message.service';
import { DoctorService } from '../../../../services/doctor.service';
import { PatientService } from '../../../../services/patient.service';
import { UploadService } from '../../../../services/upload.service';
import { AudioRecorderService } from '../../../../services/audio-recorder.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  // Données
  conversations: any[] = [];
  filteredConversations: any[] = [];
  messages: any[] = [];
  currentUserId = 1; // À remplacer par l'ID du patient connecté
  
  // État
  loading = false;
  loadingConversations = false;
  selectedDoctorId: number | null = null;
  currentChat: any = null;
  searchTerm = '';
  showMobileConversations = true;
  
  // Message en cours
  newMessage = '';
  
  // Fichiers
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  
  // Audio
  isRecording = false;
  recordedAudio: Blob | null = null;
  audioDuration: number = 0;
  
  refreshInterval: any;
  
  patientMenuItems = [
    { id: 'doctors', label: 'Médecins', link: '/patient/doctors' },
    { id: 'consultations', label: 'Consultations', link: '/patient/consultations' },
    { id: 'messages', label: 'Messages', link: '/patient/messages' },
    { id: 'profile', label: 'Profil', link: '/patient/profile' }
  ];

  constructor(
    private router: Router,
    private messageService: MessageService,
    private doctorService: DoctorService,
    private patientService: PatientService,
    private uploadService: UploadService,
    private audioRecorder: AudioRecorderService
  ) { }

  ngOnInit(): void {
    this.loadConversations();
    
    this.refreshInterval = setInterval(() => {
      if (this.selectedDoctorId) {
        this.loadMessages();
      }
      this.loadConversations();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // ===== GESTION DES CONVERSATIONS =====

  loadConversations() {
    this.loadingConversations = true;
    
    // Appel API pour récupérer les vraies conversations
    this.messageService.getPatientConversations(this.currentUserId).subscribe({
      next: (data: any[]) => {
        this.conversations = data;
        this.filterConversations();
        this.loadingConversations = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement conversations', err);
        this.loadingConversations = false;
        this.conversations = [];
      }
    });
  }

  filterConversations() {
    if (!this.searchTerm) {
      this.filteredConversations = this.conversations;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredConversations = this.conversations.filter(conv => 
        conv.doctor.firstName.toLowerCase().includes(term) ||
        conv.doctor.lastName.toLowerCase().includes(term) ||
        conv.doctor.speciality.toLowerCase().includes(term)
      );
    }
  }

  selectConversation(doctorId: number) {
    this.selectedDoctorId = doctorId;
    this.currentChat = this.conversations.find(c => c.doctorId === doctorId);
    this.showMobileConversations = false;
    this.loadMessages();
    
    // Marquer comme lu immédiatement
    this.markConversationAsRead(doctorId);
  }

  markConversationAsRead(doctorId: number) {
    const conversation = this.conversations.find(c => c.doctorId === doctorId);
    if (conversation && conversation.unreadCount > 0) {
      conversation.unreadCount = 0;
    }
  }

  // ===== GESTION DES MESSAGES =====

  loadMessages() {
    if (!this.selectedDoctorId) return;
    
    this.messageService.getConversation(this.currentUserId, this.selectedDoctorId).subscribe({
      next: (data) => {
        this.messages = data;
        this.scrollToBottom();
        
        // Marquer les messages comme lus
        this.markMessagesAsRead();
        
        // Mettre à jour le compteur de messages non lus dans la conversation
        if (this.currentChat) {
          this.currentChat.unreadCount = 0;
          const conversation = this.conversations.find(c => c.doctorId === this.selectedDoctorId);
          if (conversation) {
            conversation.unreadCount = 0;
          }
        }
      },
      error: (err) => console.error('Erreur chargement messages', err)
    });
  }

  sendMessage() {
    if (this.isRecording) {
      alert('Veuillez arrêter l\'enregistrement avant d\'envoyer');
      return;
    }

    let messageContent = this.newMessage.trim();
    
    if (this.selectedImage && !messageContent) {
      messageContent = "📷 Image envoyée";
    }
    
    if (this.recordedAudio && !messageContent) {
      messageContent = "🎤 Message vocal";
    }

    if (this.selectedImage) {
      this.uploadService.uploadImage(this.selectedImage).subscribe({
        next: (res) => {
          this.messageService.sendMessage(
            this.currentUserId, 
            this.selectedDoctorId!, 
            messageContent,
            res.imageUrl,
            undefined,
            undefined
          ).subscribe({
            next: () => {
              this.selectedImage = null;
              this.imagePreview = null;
              this.newMessage = '';
              this.loadMessages();
              this.updateLastMessage(messageContent);
            },
            error: (err) => console.error('Erreur envoi message image', err)
          });
        },
        error: (err) => {
          console.error('Erreur upload image:', err);
          alert('Erreur upload: ' + err.message);
        }
      });
    } 
    else if (this.recordedAudio) {
      const audioFile = new File([this.recordedAudio], 'audio.webm', { type: 'audio/webm' });
      
      this.uploadService.uploadAudio(audioFile).subscribe({
        next: (res) => {
          this.messageService.sendMessage(
            this.currentUserId, 
            this.selectedDoctorId!, 
            messageContent,
            undefined,
            res.audioUrl,
            this.audioDuration
          ).subscribe({
            next: () => {
              this.recordedAudio = null;
              this.audioDuration = 0;
              this.newMessage = '';
              this.loadMessages();
              this.updateLastMessage("🎤 Message vocal");
            },
            error: (err) => console.error('Erreur envoi message audio', err)
          });
        },
        error: (err) => {
          console.error('Erreur upload audio:', err);
          alert('Erreur upload audio: ' + err.message);
        }
      });
    }
    else if (this.newMessage.trim()) {
      this.messageService.sendMessage(
        this.currentUserId, 
        this.selectedDoctorId!, 
        this.newMessage,
        undefined,
        undefined,
        undefined
      ).subscribe({
        next: () => {
          this.newMessage = '';
          this.loadMessages();
          this.updateLastMessage(messageContent);
        },
        error: (err) => console.error('Erreur envoi message', err)
      });
    }
  }

  updateLastMessage(content: string) {
    if (this.currentChat) {
      this.currentChat.lastMessage = content;
      this.currentChat.lastMessageTime = new Date();
      
      // Mettre à jour dans la liste des conversations
      const conversation = this.conversations.find(c => c.doctorId === this.selectedDoctorId);
      if (conversation) {
        conversation.lastMessage = content;
        conversation.lastMessageTime = new Date();
      }
    }
  }

  markMessagesAsRead() {
    this.messageService.markAsRead(this.currentUserId).subscribe({
      next: () => {
        console.log('Messages marqués comme lus');
      },
      error: (err) => console.error('Erreur marquage lecture', err)
    });
  }

  // ===== GESTION DES FICHIERS =====

  getFullUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return 'http://localhost:8081' + url;
    return url;
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/default-doctor.png';
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  cancelImage() {
    this.selectedImage = null;
    this.imagePreview = null;
    this.fileInput.nativeElement.value = '';
  }

  // ===== GESTION DE L'AUDIO =====

  async startRecording() {
    try {
      await this.audioRecorder.startRecording();
      this.isRecording = true;
    } catch (error) {
      console.error('Erreur enregistrement:', error);
      alert('Impossible d\'accéder au microphone');
    }
  }

  async stopRecording() {
    try {
      const { blob, duration } = await this.audioRecorder.stopRecording();
      this.recordedAudio = blob;
      this.audioDuration = duration;
      this.isRecording = false;
    } catch (error) {
      console.error('Erreur arrêt enregistrement:', error);
    }
  }

  cancelRecording() {
    this.audioRecorder.cancelRecording();
    this.isRecording = false;
    this.recordedAudio = null;
  }

  cancelAudio() {
    this.recordedAudio = null;
    this.audioDuration = 0;
  }

  // ===== UTILITAIRES =====

  scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  formatTime(date: string | Date): string {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return messageDate.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    }
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // ===== NAVIGATION =====

  goToDoctors() {
    this.router.navigate(['/patient/doctors']);
  }

  startNewChat() {
    this.router.navigate(['/patient/doctors']);
  }

  viewDoctorProfile() {
    if (this.selectedDoctorId) {
      this.router.navigate(['/patient/doctor', this.selectedDoctorId]);
    }
  }

  scheduleAppointment() {
    if (this.selectedDoctorId) {
      this.router.navigate(['/patient/appointment', this.selectedDoctorId]);
    }
  }
}