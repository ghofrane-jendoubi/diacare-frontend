import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MessageService, SendMessageRequest, DoctorConversationDTO } from '../../../../services/message.service';
import { DoctorService } from '../../../../services/doctor.service';
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
  @ViewChild('documentInput') documentInput!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;
  
  // Données
  conversations: DoctorConversationDTO[] = [];
  filteredConversations: DoctorConversationDTO[] = [];
  messages: any[] = [];
  currentUserId: number | null = null; // ✅ Changé: plus de valeur statique
  
  // État
  loading = false;
  loadingConversations = false;
  selectedDoctorId: number | null = null;
  selectedDoctor: DoctorConversationDTO | null = null;
  searchTerm = '';
  showMobileConversations = true;
  
  // Message en cours
  newMessage = '';
  
  // Fichiers
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  selectedDocument: File | null = null;
  documentPreview: string | null = null;
  
  // Audio
  isRecording = false;
  recordedAudio: Blob | null = null;
  audioDuration: number = 0;
  private currentAudio: HTMLAudioElement | null = null;
  private currentPlayingMessage: any = null;
  
  // Scroll
  private userScrolled = false;
  private scrollTimeout: any;
  
  // PDF Viewer
  showPdfModal = false;
  currentPdfUrl: SafeResourceUrl = '';
  currentPdfName = '';
  
  refreshInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private doctorService: DoctorService,
    private uploadService: UploadService,
    private audioRecorder: AudioRecorderService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
 
  const patientIdStr = localStorage.getItem('patient_id') 
                    || localStorage.getItem('user_id')
                    || localStorage.getItem('userId');
  
  if (patientIdStr) {
    this.currentUserId = parseInt(patientIdStr);
  } else {
    // Temporaire : utiliser l'ID de session si disponible
    console.error('patient_id non trouvé dans localStorage');
    console.log('Toutes les clés:', Object.keys(localStorage));
    console.log('Valeurs:', Object.fromEntries(
      Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])
    ));
  }
  
  console.log('Patient connecté ID:', this.currentUserId);
    
    // Charger les conversations
    this.loadConversations();
    
    this.route.params.subscribe(params => {
      const doctorId = params['doctorId'];
      
      if (doctorId) {
        this.selectedDoctorId = Number(doctorId);
        this.showMobileConversations = false;
        
        // Chercher dans les conversations déjà chargées
        const existing = this.conversations.find(c => c.doctorId === this.selectedDoctorId);
        if (existing) {
          this.selectedDoctor = existing;
        }
        
        this.loadMessages();
      } else {
        this.selectedDoctorId = null;
        this.selectedDoctor = null;
        this.messages = [];
        this.showMobileConversations = true;
      }
    });
    
    setTimeout(() => this.setupScrollListener(), 500);
    
    this.refreshInterval = setInterval(() => {
      if (this.selectedDoctorId) this.loadMessages();
      this.loadConversations();
    }, 50000);
  }
  
  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.removeEventListener('scroll', () => {});
    }
  }

  // ===== GESTION DU SCROLL =====
  
  scrollToBottom(force: boolean = false) {
    if (this.userScrolled && !force) {
      return;
    }
    
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
  
  private setupScrollListener() {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.addEventListener('scroll', () => {
        const element = this.messagesContainer.nativeElement;
        const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
        
        if (isAtBottom) {
          this.userScrolled = false;
        } else {
          this.userScrolled = true;
          
          if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
          }
          this.scrollTimeout = setTimeout(() => {
            this.userScrolled = false;
          }, 50000);
        }
      });
    }
  }

  // ===== GESTION DES CONVERSATIONS =====

  loadConversations() {
    // ✅ Vérifier que currentUserId existe
    if (!this.currentUserId) return;
    
    this.loadingConversations = true;
    
    this.messageService.getPatientConversations(this.currentUserId).subscribe({
      next: (data: DoctorConversationDTO[]) => {
        this.conversations = data;
        this.filterConversations();
        this.loadingConversations = false;
        
        // Mettre à jour selectedDoctor une fois que la liste est chargée
        if (this.selectedDoctorId) {
          const existing = this.conversations.find(c => c.doctorId === this.selectedDoctorId);
          if (existing) {
            this.selectedDoctor = existing;
          } else {
            // Pas encore de conversation → charger depuis l'API médecin
            this.loadDoctorInfoFromApi(this.selectedDoctorId);
          }
        }
      },
      error: (err: any) => {
        console.error('Erreur chargement conversations', err);
        this.loadingConversations = false;
        this.conversations = [];
        this.filteredConversations = [];
        
        // Même en cas d'erreur, charger le médecin sélectionné
        if (this.selectedDoctorId) {
          this.loadDoctorInfoFromApi(this.selectedDoctorId);
        }
      }
    });
  }
  
  filterConversations() {
    if (!this.searchTerm) {
      this.filteredConversations = [...this.conversations];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredConversations = this.conversations.filter(conv => 
        conv.doctorName.toLowerCase().includes(term) ||
        conv.speciality.toLowerCase().includes(term)
      );
    }
    console.log('Conversations filtrées:', this.filteredConversations.length);
  }

  // ===== CHARGEMENT DES INFOS DU MÉDECIN =====
  
  private loadDoctorInfoFromApi(doctorId: number) {
    this.doctorService.getDoctorById(doctorId).subscribe({
      next: (doctor) => {
        this.selectedDoctor = {
          doctorId: doctor.id,
          doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          doctorProfilePicture: doctor.profilePicture || '',
          speciality: doctor.speciality,
          lastMessage: 'Commencez votre conversation...',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
        };
      },
      error: () => {
        this.selectedDoctor = {
          doctorId: doctorId,
          doctorName: `Médecin #${doctorId}`,
          doctorProfilePicture: '',
          speciality: 'Médecin',
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
        };
      }
    });
  }

  // ===== SÉLECTION D'UNE CONVERSATION =====
  
  selectConversation(doctorId: number) {
    console.log('Sélection du médecin:', doctorId);
    
    if (this.selectedDoctorId === doctorId) {
      return;
    }
    
    this.router.navigate(['/patient/chat', doctorId]);
  }

  // ===== GESTION DES MESSAGES =====

  loadMessages() {
    // ✅ Vérifier que currentUserId et selectedDoctorId existent
    if (!this.currentUserId || !this.selectedDoctorId) return;
    
    this.messageService.getConversation(this.currentUserId, this.selectedDoctorId).subscribe({
      next: (data) => {
        const oldHeight = this.messagesContainer?.nativeElement?.scrollHeight;
        this.messages = data;
        
        // Mettre à jour le dernier message dans la conversation
        if (data.length > 0) {
          const lastMessage = data[data.length - 1];
          const conversation = this.conversations.find(c => c.doctorId === this.selectedDoctorId);
          if (conversation) {
            conversation.lastMessage = lastMessage.content || 
              (lastMessage.imageUrl ? '📷 Image' : 
              (lastMessage.audioUrl ? '🎤 Audio' : 
              (lastMessage.documentUrl ? '📄 Document' : 'Nouveau message')));
            conversation.lastMessageTime = lastMessage.sentAt;
            conversation.unreadCount = 0;
            this.filterConversations();
          }
        }
        
        // Gestion du scroll
        if (!this.userScrolled) {
          this.scrollToBottom(true);
        } else {
          setTimeout(() => {
            if (this.messagesContainer && oldHeight) {
              const newHeight = this.messagesContainer.nativeElement.scrollHeight;
              const scrollDiff = newHeight - oldHeight;
              if (scrollDiff > 0) {
                this.messagesContainer.nativeElement.scrollTop += scrollDiff;
              }
            }
          }, 100000);
        }
        
        this.markMessagesAsRead();
      },
      error: (err) => console.error('Erreur chargement messages', err)
    });
  }

  sendMessage() {
    // ✅ Vérifier que currentUserId existe
    if (!this.currentUserId) {
      alert('Erreur: Utilisateur non identifié');
      return;
    }
    
    if (this.isRecording) {
      alert('Veuillez arrêter l\'enregistrement avant d\'envoyer');
      return;
    }

    if (!this.selectedDoctorId) {
      alert('Aucun médecin sélectionné');
      return;
    }

    let messageContent = this.newMessage.trim();
    
    if (this.selectedImage && !messageContent) {
      messageContent = "📷 Image envoyée";
    }
    
    if (this.recordedAudio && !messageContent) {
      messageContent = "🎤 Message vocal";
    }
    
    if (this.selectedDocument && !messageContent) {
      messageContent = `📄 Document: ${this.selectedDocument.name}`;
    }

    if (!messageContent && !this.selectedImage && !this.recordedAudio && !this.selectedDocument) {
      return;
    }

    if (this.selectedImage) {
      this.uploadService.uploadImage(this.selectedImage).subscribe({
        next: (res) => {
          this.messageService.sendMessage({
            senderId: this.currentUserId!,
            receiverId: this.selectedDoctorId!,
            content: messageContent,
            imageUrl: res.imageUrl
          }).subscribe({
            next: () => {
              this.selectedImage = null;
              this.imagePreview = null;
              this.newMessage = '';
              this.loadMessages();
              this.loadConversations();
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
    else if (this.selectedDocument) {
      this.uploadService.uploadDocument(this.selectedDocument).subscribe({
        next: (res) => {
          this.messageService.sendMessage({
            senderId: this.currentUserId!,
            receiverId: this.selectedDoctorId!,
            content: messageContent,
            documentUrl: res.documentUrl
          }).subscribe({
            next: () => {
              this.selectedDocument = null;
              this.documentPreview = null;
              this.newMessage = '';
              this.loadMessages();
              this.loadConversations();
            },
            error: (err) => console.error('Erreur envoi message document', err)
          });
        },
        error: (err) => {
          console.error('Erreur upload document:', err);
          alert('Erreur upload: ' + err.message);
        }
      });
    }
    else if (this.recordedAudio) {
      const audioFile = new File([this.recordedAudio], 'audio.webm', { type: 'audio/webm' });
      
      this.uploadService.uploadAudio(audioFile).subscribe({
        next: (res) => {
          this.messageService.sendMessage({
            senderId: this.currentUserId!,
            receiverId: this.selectedDoctorId!,
            content: messageContent,
            audioUrl: res.audioUrl,
            audioDuration: this.audioDuration
          }).subscribe({
            next: () => {
              this.recordedAudio = null;
              this.audioDuration = 0;
              this.newMessage = '';
              this.loadMessages();
              this.loadConversations();
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
      this.messageService.sendMessage({
        senderId: this.currentUserId!,
        receiverId: this.selectedDoctorId!,
        content: this.newMessage
      }).subscribe({
        next: () => {
          this.newMessage = '';
          this.loadMessages();
          this.loadConversations();
          
          setTimeout(() => {
            this.focusMessageInput();
          }, 1000);
        },
        error: (err) => console.error('Erreur envoi message', err)
      });
    }
  }

  markMessagesAsRead() {
  if (!this.currentUserId || !this.selectedDoctorId) return;
  
  //  doctorId en premier, patientId (currentUserId) en second
  this.messageService.markMessagesAsRead(this.selectedDoctorId, this.currentUserId).subscribe({
    next: () => {
      const conversation = this.conversations.find(c => c.doctorId === this.selectedDoctorId);
      if (conversation) {
        conversation.unreadCount = 0;
        this.filterConversations();
      }
    },
    error: (err) => console.error('Erreur marquage lecture', err)
  });
}
  focusMessageInput() {
    if (this.messageInput) {
      this.messageInput.nativeElement.focus();
    }
  }

  // ===== GESTION DES FICHIERS =====

  getFullUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return 'http://localhost:8081' + url;
    return url;
  }

  onImageError(event: any) {
    event.target.src = '/default-doctor.png';
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

  onDocumentSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedDocument = file;
      this.documentPreview = file.name;
    }
  }

  cancelDocument() {
    this.selectedDocument = null;
    this.documentPreview = null;
    this.documentInput.nativeElement.value = '';
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

  toggleAudio(message: any) {
    if (this.currentPlayingMessage === message) {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentPlayingMessage = null;
      }
    } else {
      if (this.currentAudio) {
        this.currentAudio.pause();
      }
      
      const audio = new Audio(this.getFullUrl(message.audioUrl));
      this.currentAudio = audio;
      this.currentPlayingMessage = message;
      
      audio.play();
      audio.onended = () => {
        this.currentPlayingMessage = null;
        this.currentAudio = null;
      };
    }
  }

  isPlaying(message: any): boolean {
    return this.currentPlayingMessage === message;
  }

  // ===== GESTION DES DOCUMENTS =====

  openDocument(documentUrl: string) {
    const fullUrl = this.getFullUrl(documentUrl);
    const extension = documentUrl.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
      this.currentPdfUrl = safeUrl;
      this.currentPdfName = this.getDocumentName(documentUrl);
      this.showPdfModal = true;
    } else {
      window.open(fullUrl, '_blank');
    }
  }

  downloadDocument(documentUrl: string) {
    const fullUrl = this.getFullUrl(documentUrl);
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = this.getDocumentName(documentUrl);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadCurrentPdf() {
    const link = document.createElement('a');
    link.href = this.currentPdfUrl as string;
    link.download = this.currentPdfName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  closePdfModal() {
    this.showPdfModal = false;
    setTimeout(() => {
      this.currentPdfUrl = '';
      this.currentPdfName = '';
    }, 300);
  }

  getDocumentName(documentUrl: string): string {
    if (!documentUrl) return 'Document';
    const parts = documentUrl.split('/');
    let fileName = parts[parts.length - 1];
    
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i;
    if (uuidPattern.test(fileName)) {
      fileName = fileName.replace(uuidPattern, '');
    }
    
    return decodeURIComponent(fileName);
  }

  getDocumentIcon(documentUrl: string): string {
    if (!documentUrl) return 'bi-file-earmark';
    const extension = documentUrl.split('.').pop()?.toLowerCase();
    return this.getIconByExtension(extension);
  }

  getDocumentIconByName(fileName: string): string {
    if (!fileName) return 'bi-file-earmark';
    const extension = fileName.split('.').pop()?.toLowerCase();
    return this.getIconByExtension(extension);
  }

  private getIconByExtension(extension?: string): string {
    switch(extension) {
      case 'pdf': return 'bi-file-earmark-pdf';
      case 'doc': case 'docx': return 'bi-file-earmark-word';
      case 'xls': case 'xlsx': return 'bi-file-earmark-excel';
      case 'txt': return 'bi-file-earmark-text';
      default: return 'bi-file-earmark';
    }
  }

  getDocumentSize(documentUrl: string): string {
    return '';
  }

  // ===== UTILITAIRES =====

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

  goToChatList() {
    this.router.navigate(['/patient/chat']);
    this.selectedDoctorId = null;
    this.selectedDoctor = null;
    this.messages = [];
    this.showMobileConversations = true;
  }
}