import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MessageService } from '../../../../../../services/message.service';

@Component({
  selector: 'app-send-result-modal',
  templateUrl: './send-result-modal.component.html',
  styleUrls: ['./send-result-modal.component.css']
})
export class SendResultModalComponent {
  @Input() analysisData: any;
  @Input() doctorId: number = 0;
  @Output() closeModal = new EventEmitter<void>();
  @Output() resultSent = new EventEmitter<any>();

  responseData = {
    message: '',
    prescription: '',
    includeImage: true
  };
  isSending = false;

  constructor(private messageService: MessageService) {}

  sendResponse() {
  this.isSending = true;

  const result = this.analysisData.result;
  const resultEmoji = result.prediction === 'Diabetes' ? '🔴' : '🟢';
  const resultText = result.prediction === 'Diabetes' ? 'Diabète détecté' : 'Non diabétique';
  
  const fullMessage = `${resultEmoji} *Résultat de l'analyse DiaCare* ${resultEmoji}\n\n` +
                     `📊 **${resultText}**\n` +
                     `📈 Confiance : ${result.confidence}%\n\n` +
                     `📝 **Message du médecin :**\n${this.responseData.message}\n\n` +
                     `💊 **Recommandations :**\n${this.responseData.prescription}`;

  this.messageService.sendMessage(
    this.doctorId,
    this.analysisData.patientId,
    fullMessage,
    this.responseData.includeImage ? this.analysisData.imageUrl : undefined,  // ← null → undefined
    undefined,  // ← audioUrl
    undefined   // ← audioDuration
  ).subscribe({
    next: () => {
      this.resultSent.emit({
        success: true,
        message: fullMessage
      });
      this.closeModal.emit();
    },
    error: (err) => {
      console.error('Erreur envoi résultat:', err);
      alert('Erreur lors de l\'envoi du résultat');
      this.isSending = false;
    }
  });
}
  close() {
    this.closeModal.emit();
  }
}