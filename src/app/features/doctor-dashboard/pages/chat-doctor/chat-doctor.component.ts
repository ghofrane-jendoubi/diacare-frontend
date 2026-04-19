import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MessageService, SendMessageRequest } from '../../../../services/message.service';
import { PatientService } from '../../../../services/patient.service';
import { UploadService } from '../../../../services/upload.service';
import { AudioRecorderService } from '../../../../services/audio-recorder.service';
import { ImageAnalysisModalComponent } from './modals/image-analysis-modal/image-analysis-modal.component';
import { SendResultModalComponent } from './modals/send-result-modal/send-result-modal.component';
import { AiAnalysisService } from '../../../../services/ai-analysis.service'; 

@Component({
  selector: 'app-chat-doctor',
  templateUrl: './chat-doctor.component.html',
  styleUrls: ['./chat-doctor.component.css']
})
export class ChatDoctorComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('documentInput') documentInput!: ElementRef;
  
  // Données des messages
  messages: any[] = [];
  newMessage = '';
  currentDoctorId: number | null = null;
  loading = false;
  refreshInterval: any;
  
  // Conversations
  conversations: any[] = [];
  filteredConversations: any[] = [];
  selectedPatientId: number | null = null;
  currentPatient: any = null;
  loadingConversations = false;
  searchTerm = '';
  showMobileConversations = true;
  
  // Modals
  showAnalysisModal = false;
  showSendModal = false;
  selectedImageForAnalysis: string = '';
  analysisResultData: any = null;
  
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private patientService: PatientService,
    private uploadService: UploadService,
    private aiAnalysisService: AiAnalysisService,
    private audioRecorder: AudioRecorderService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
  // Debug
  console.log('localStorage doctor_id:', localStorage.getItem('doctor_id'));
  console.log('Toutes les clés:', Object.keys(localStorage));
  
  const doctorIdStr = localStorage.getItem('doctor_id') || localStorage.getItem('doctorId');;
  
  if (!doctorIdStr) {
    console.error('doctor_id absent du localStorage');
    
    return;
  }
  
  this.currentDoctorId = parseInt(doctorIdStr);
  console.log('Médecin connecté ID:', this.currentDoctorId);
  
  this.loadConversations();

    this.route.params.subscribe(params => {
      const patientIdFromUrl = params['patientId'];

      if (patientIdFromUrl) {
        const patientId = Number(patientIdFromUrl);
        this.selectedPatientId = patientId;
        this.showMobileConversations = false;
        this.loadMessages(true, true);

        const existing = this.conversations.find(c => c.patientId === patientId);
        if (existing) {
          this.currentPatient = {
            id: existing.patientId,
            firstName: existing.patientName.split(' ')[0],
            lastName: existing.patientName.split(' ').slice(1).join(' '),
            profilePicture: existing.patientProfilePicture,
            diabetesType: existing.diabetesType,
            online: existing.online || false
          };
        }
      } else {
        this.selectedPatientId = null;
        this.currentPatient = null;
        this.messages = [];
        this.showMobileConversations = true;
      }
    });

    setTimeout(() => this.setupScrollListener(), 500);

    this.refreshInterval = setInterval(() => {
      this.loadConversations();
      if (this.selectedPatientId) {
        this.loadMessages(false, false);
      }
    }, 300000);
  }
  
  private createNewConversation(patientId: number) {
    console.log('Création d\'une nouvelle conversation avec le patient:', patientId);
    this.selectedPatientId = patientId;
    
    this.patientService.getPatientById(patientId).subscribe({
      next: (data) => {
        console.log('Patient chargé:', data);
        this.currentPatient = data;
        this.loadMessages(true, true);
        
        const exists = this.conversations.some(c => c.patientId === data.id);
        if (!exists) {
          const newConversation = {
            patientId: data.id,
            patientName: `${data.firstName} ${data.lastName}`,
            patientProfilePicture: data.profilePicture,
            diabetesType: data.diabetesType,
            lastMessage: 'Aucun message',
            lastMessageTime: new Date().toISOString(),
            lastMessageSender: null,
            unreadCount: 0,
            online: data.online || false
          };
          
          this.conversations = [newConversation, ...this.conversations];
          this.filterConversations();
        }
      },
      error: (err) => {
        console.error('Erreur chargement patient', err);
        this.currentPatient = { 
          id: patientId,
          firstName: 'Patient', 
          lastName: `#${patientId}`,
          diabetesType: null,
          profilePicture: null,
          online: false
        };
        this.messages = [];
        
        const exists = this.conversations.some(c => c.patientId === patientId);
        if (!exists) {
          const newConversation = {
            patientId: patientId,
            patientName: `Patient #${patientId}`,
            patientProfilePicture: null,
            diabetesType: null,
            lastMessage: 'Aucun message',
            lastMessageTime: new Date().toISOString(),
            lastMessageSender: null,
            unreadCount: 0,
            online: false
          };
          
          this.conversations = [newConversation, ...this.conversations];
          this.filterConversations();
        }
      }
    });
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
          }, 500000);
        }
      });
    }
  }

  loadConversations() {
    if (!this.currentDoctorId) return;
    
    this.loadingConversations = true;
    
    this.messageService.getDoctorConversations(this.currentDoctorId).subscribe({
      next: (data: any[]) => {
        this.conversations = data;
        this.filterConversations();
        this.loadingConversations = false;

        if (this.selectedPatientId) {
          const conv = this.conversations.find(c => c.patientId === this.selectedPatientId);
          if (conv) {
            this.currentPatient = {
              id: conv.patientId,
              firstName: conv.patientName.split(' ')[0],
              lastName: conv.patientName.split(' ').slice(1).join(' '),
              profilePicture: conv.patientProfilePicture,
              diabetesType: conv.diabetesType,
              online: conv.online || false
            };
          } else if (!this.currentPatient) {
            this.createNewConversation(this.selectedPatientId);
          }
        }
      },
      error: (err: any) => {
        console.error('Erreur chargement conversations', err);
        this.loadingConversations = false;
        if (!this.conversations.length) {
          this.conversations = [];
          this.filteredConversations = [];
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
        conv.patientName.toLowerCase().includes(term)
      );
    }
    console.log('Conversations filtrées:', this.filteredConversations.length);
  }

  selectConversation(patientId: number) {
    console.log('Sélection du patient:', patientId);
    
    if (this.selectedPatientId === patientId && this.currentPatient) {
      console.log('Déjà sélectionné');
      return;
    }
    
    this.router.navigate(['/doctor/chat', patientId], { replaceUrl: true });
    
    this.selectedPatientId = patientId;
    
    const conversation = this.conversations.find(c => c.patientId === patientId);
    if (conversation) {
      console.log('Patient trouvé dans les conversations:', conversation);
      this.currentPatient = {
        id: conversation.patientId,
        firstName: conversation.patientName.split(' ')[0],
        lastName: conversation.patientName.split(' ')[1] || '',
        profilePicture: conversation.patientProfilePicture,
        diabetesType: conversation.diabetesType,
        online: conversation.online
      };
      this.loadMessages(true, true);
    } else {
      this.patientService.getPatientById(patientId).subscribe({
        next: (data) => {
          console.log('Patient chargé depuis API:', data);
          this.currentPatient = data;
          this.loadMessages(true, true);
        },
        error: (err) => {
          console.error('Erreur chargement patient', err);
          this.currentPatient = { 
            id: patientId,
            firstName: 'Patient', 
            lastName: `#${patientId}`,
            diabetesType: null,
            profilePicture: null,
            online: false
          };
          this.loadMessages(true, true);
        }
      });
    }
    
    this.markMessagesAsRead();
    
    if (window.innerWidth <= 768) {
      this.showMobileConversations = false;
    }
  }

  loadMessages(markAsRead: boolean = true, forceScroll: boolean = false) {
    if (!this.currentDoctorId || !this.selectedPatientId) {
      console.log('Médecin non connecté ou patient non sélectionné');
      return;
    }
    
    console.log('Chargement des messages avec patient:', this.selectedPatientId);
    
    this.messageService.getConversation(this.currentDoctorId, this.selectedPatientId).subscribe({
      next: (data) => {
        console.log('Messages chargés:', data.length);
        const oldHeight = this.messagesContainer?.nativeElement?.scrollHeight;
        this.messages = data;
        
        if (data.length > 0) {
          const lastMessage = data[data.length - 1];
          const conversation = this.conversations.find(c => c.patientId === this.selectedPatientId);
          if (conversation) {
            conversation.lastMessage = lastMessage.content || 
              (lastMessage.imageUrl ? '📷 Image' : 
              (lastMessage.audioUrl ? '🎤 Audio' : 
              (lastMessage.documentUrl ? '📄 Document' : 'Nouveau message')));
            conversation.lastMessageTime = lastMessage.sentAt;
            conversation.lastMessageSender = lastMessage.sender.id;
            conversation.unreadCount = 0;
            this.filterConversations();
          }
        }
        
        if (!this.userScrolled || forceScroll) {
          this.scrollToBottom(forceScroll);
        } else {
          setTimeout(() => {
            if (this.messagesContainer && oldHeight) {
              const newHeight = this.messagesContainer.nativeElement.scrollHeight;
              const scrollDiff = newHeight - oldHeight;
              if (scrollDiff > 0) {
                this.messagesContainer.nativeElement.scrollTop += scrollDiff;
              }
            }
          }, 10000);
        }
        
        if (markAsRead) {
          this.markMessagesAsRead();
        }
      },
      error: (err) => {
        console.error('Erreur chargement messages', err);
      }
    });
  }

  sendMessage() {
    if (!this.currentDoctorId) {
      alert('Erreur: Médecin non identifié');
      return;
    }
    
    if (this.isRecording) {
      alert('Veuillez arrêter l\'enregistrement avant d\'envoyer');
      return;
    }

    if (!this.selectedPatientId) {
      alert('Aucun patient sélectionné');
      return;
    }

    let messageContent = this.newMessage.trim();
    
    if (this.selectedImage && !messageContent) {
      messageContent = "📷 Image médicale";
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
      console.log('Envoi image:', this.selectedImage.name);
      this.uploadService.uploadImage(this.selectedImage).subscribe({
        next: (res) => {
          const request: SendMessageRequest = {
            senderId: this.currentDoctorId!,
            receiverId: this.selectedPatientId!,
            content: messageContent,
            imageUrl: res.imageUrl
          };
          
          this.messageService.sendMessage(request).subscribe({
            next: () => {
              this.selectedImage = null;
              this.imagePreview = null;
              this.newMessage = '';
              this.loadMessages(true, true);
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
      console.log('Envoi document:', this.selectedDocument.name);
      this.uploadService.uploadDocument(this.selectedDocument).subscribe({
        next: (res) => {
          const request: SendMessageRequest = {
            senderId: this.currentDoctorId!,
            receiverId: this.selectedPatientId!,
            content: messageContent,
            documentUrl: res.documentUrl
          };
          
          this.messageService.sendMessage(request).subscribe({
            next: () => {
              this.selectedDocument = null;
              this.documentPreview = null;
              this.newMessage = '';
              this.loadMessages(true, true);
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
          const request: SendMessageRequest = {
            senderId: this.currentDoctorId!,
            receiverId: this.selectedPatientId!,
            content: messageContent,
            audioUrl: res.audioUrl,
            audioDuration: this.audioDuration
          };
          
          this.messageService.sendMessage(request).subscribe({
            next: () => {
              this.recordedAudio = null;
              this.audioDuration = 0;
              this.newMessage = '';
              this.loadMessages(true, true);
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
      const request: SendMessageRequest = {
        senderId: this.currentDoctorId!,
        receiverId: this.selectedPatientId!,
        content: this.newMessage
      };
      
      this.messageService.sendMessage(request).subscribe({
        next: () => {
          this.newMessage = '';
          this.loadMessages(true, true);
          this.loadConversations();
        },
        error: (err) => console.error('Erreur envoi message', err)
      });
    }
  }

  markMessagesAsRead() {
    if (!this.currentDoctorId || !this.selectedPatientId) return;
    
    this.messageService.markMessagesAsRead(this.currentDoctorId, this.selectedPatientId).subscribe({
      next: () => {
        const conversation = this.conversations.find(c => c.patientId === this.selectedPatientId);
        if (conversation) {
          conversation.unreadCount = 0;
          this.filterConversations();
        }
      },
      error: (err) => {
        console.error('Erreur marquage lecture', err);
      }
    });
  }

  // chat-doctor.component.ts
getFullUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) return `http://localhost:8081${url}`;
  // Pour les chemins relatifs
  return `http://localhost:8081/uploads/patients/${url}`;
}

// Ajouter une méthode pour l'avatar par défaut
getDefaultAvatar(): string {
  return 'https://ui-avatars.com/api/?background=2ecc71&color=fff&bold=true&rounded=true&size=48';
}

// Méthode pour obtenir l'avatar avec fallback
getPatientAvatar(profilePicture: string | null | undefined, patientName: string): string {
  if (profilePicture) {
    const fullUrl = this.getFullUrl(profilePicture);
    // Vérifier si l'URL est valide
    if (fullUrl) return fullUrl;
  }
  // Générer un avatar avec les initiales
  const initials = this.getInitials(patientName);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=2ecc71&color=fff&bold=true&rounded=true&size=48`;
}

private getInitials(name: string): string {
  if (!name) return 'P';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

  onImageError(event: any) {
    event.target.src = '/default-image.png';
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

  formatTime(date: string): string {
    const messageDate = new Date(date);
    const today = new Date();
    
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString() + ' ' + 
             messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  goToPatients() {
    this.router.navigate(['/doctor/patients']);
  }

  goToChatList() {
    this.router.navigate(['/doctor/chat']);
    this.selectedPatientId = null;
    this.currentPatient = null;
    this.messages = [];
    this.showMobileConversations = true;
  }

  viewPatientProfile() {
    if (this.selectedPatientId) {
      this.router.navigate(['/doctor/patient', this.selectedPatientId]);
    }
  }

  scheduleAppointment() {
    if (this.selectedPatientId) {
      this.router.navigate(['/doctor/appointment', this.selectedPatientId]);
    }
  }

  analyzeImage(imageUrl: string) {
    this.selectedImageForAnalysis = imageUrl;
    this.showAnalysisModal = true;
  }

  onAnalysisComplete(event: any) {
    this.showAnalysisModal = false;
    this.analysisResultData = event;
    setTimeout(() => {
      this.showSendModal = true;
    }, 300);
  }

  onResultSent(event: any) {
    this.showSendModal = false;
    this.analysisResultData = null;
    
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = '<i class="bi bi-check-circle-fill"></i> Résultat envoyé au patient';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
}