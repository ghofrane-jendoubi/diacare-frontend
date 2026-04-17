import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AiAnalysisService } from '../../../../../../services/ai-analysis.service';

@Component({
  selector: 'app-image-analysis-modal',
  templateUrl: './image-analysis-modal.component.html',
  styleUrls: ['./image-analysis-modal.component.css']
})
export class ImageAnalysisModalComponent {
  @Input() imageUrl: string = '';
  @Input() patientId: number = 0;
  @Output() closeModal = new EventEmitter<void>();
  @Output() sendResult = new EventEmitter<any>();

  analysisResult: any = null;
  error: string = '';
  isLoading: boolean = true;

  constructor(private aiService: AiAnalysisService) {}

  ngOnInit() {
    this.analyzeImage();
  }

  analyzeImage() {
    this.isLoading = true;
    this.error = '';

    // Récupérer l'image depuis l'URL
    fetch(this.getFullUrl(this.imageUrl))
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'tongue.jpg', { type: 'image/jpeg' });
        return this.aiService.analyzeImage(file).toPromise();
      })
      .then(result => {
        this.analysisResult = result;
        this.isLoading = false;
      })
      .catch(err => {
        console.error('Erreur analyse:', err);
        this.error = 'Erreur lors de l\'analyse de l\'image';
        this.isLoading = false;
      });
  }

  retryAnalysis() {
    this.analyzeImage();
  }

  openSendModal() {
    this.sendResult.emit({
      result: this.analysisResult,
      imageUrl: this.imageUrl,
      patientId: this.patientId
    });
  }

  getFullUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return 'http://localhost:8081' + url;
  }

  close() {
    this.closeModal.emit();
  }
}