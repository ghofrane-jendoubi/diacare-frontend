import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../../services/message.service';
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
  
  messages: any[] = [];
  newMessage = '';
  patientId: number = 0;
  currentDoctorId = 4; // ID du médecin connecté
  patient: any = null;
  loading = false;
  refreshInterval: any;

  showAnalysisModal = false;
showSendModal = false;
selectedImageForAnalysis: string = '';
analysisResultData: any = null;
  
  // Pour les fichiers
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  
  // Pour l'audio
  isRecording = false;
  recordedAudio: Blob | null = null;
  audioDuration: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private patientService: PatientService,
    private uploadService: UploadService,
    private aiAnalysisService: AiAnalysisService,
    private audioRecorder: AudioRecorderService
  ) { }

  ngOnInit(): void {
    this.patientId = Number(this.route.snapshot.paramMap.get('patientId'));
    
    this.patientService.getPatientById(this.patientId).subscribe({
      next: (data) => {
        this.patient = data;
      },
      error: (err) => {
        console.error('Erreur chargement patient, utilisation ID seulement');
        this.patient = { firstName: 'Patient', lastName: `#${this.patientId}` };
      }
    });
    
    this.loadMessages();
    
    this.refreshInterval = setInterval(() => {
      this.loadMessages(false);
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // ===== GESTION DES MESSAGES =====
  
  loadMessages(markAsRead: boolean = true) {
    this.messageService.getConversation(this.currentDoctorId, this.patientId).subscribe({
      next: (data) => {
        this.messages = data;
        this.scrollToBottom();
        
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
    if (this.isRecording) {
      alert('Veuillez arrêter l\'enregistrement avant d\'envoyer');
      return;
    }

    let messageContent = this.newMessage.trim();
    
    if (this.selectedImage && !messageContent) {
      messageContent = "📷 Image médicale";
    }
    
    if (this.recordedAudio && !messageContent) {
      messageContent = "🎤 Message vocal";
    }

    if (this.selectedImage) {
      console.log('Envoi image:', this.selectedImage.name);
      this.uploadService.uploadImage(this.selectedImage).subscribe({
        next: (res) => {
          console.log('Upload image réussi:', res);
          this.messageService.sendMessage(
            this.currentDoctorId, 
            this.patientId, 
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
      console.log('Envoi audio, taille:', this.recordedAudio.size);
      const audioFile = new File([this.recordedAudio], 'audio.webm', { type: 'audio/webm' });
      
      this.uploadService.uploadAudio(audioFile).subscribe({
        next: (res) => {
          console.log('Upload audio réussi:', res);
          this.messageService.sendMessage(
            this.currentDoctorId, 
            this.patientId, 
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
        this.currentDoctorId, 
        this.patientId, 
        this.newMessage,
        undefined,
        undefined,
        undefined
      ).subscribe({
        next: () => {
          this.newMessage = '';
          this.loadMessages();
        },
        error: (err) => console.error('Erreur envoi message', err)
      });
    }
  }

  markMessagesAsRead() {
    this.messageService.markAsRead(this.currentDoctorId).subscribe({
      next: () => {
        console.log('Messages marqués comme lus');
      },
      error: (err) => {
        console.error('Erreur marquage lecture', err);
      }
    });
  }

  // ===== GESTION DES FICHIERS =====

  getFullUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return 'http://localhost:8081' + url;
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/default-image.png';
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }

  // ===== GESTION DES IMAGES =====

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

  goBack() {
    this.router.navigate(['/doctor/patients']);
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
  }, 300); // Petit délai pour animation
}

onResultSent(event: any) {
  this.showSendModal = false;
  this.analysisResultData = null;
  
  // Afficher une notification temporaire
  const notification = document.createElement('div');
  notification.className = 'notification success';
  notification.innerHTML = '<i class="bi bi-check-circle-fill"></i> Résultat envoyé au patient';
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}
}