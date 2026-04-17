import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-feedback-modal',
  templateUrl: './feedback-modal.component.html',
  styleUrls: ['./feedback-modal.component.css']
})
export class FeedbackModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() contentId!: number;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  selectedEmotion = '';
  comment = '';
  isSubmitting = false;
  error = '';

  constructor(private feedbackService: FeedbackService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue) {
      this.selectedEmotion = '';
      this.comment = '';
      this.error = '';
    }
  }

  selectEmotion(emotion: string) {
    this.selectedEmotion = emotion;
    this.error = '';
  }

  close() {
    this.closed.emit();
  }

  submit() {
    if (!this.contentId || !this.selectedEmotion || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    this.feedbackService.submitFeedback(this.contentId, this.selectedEmotion, this.comment.trim() || undefined)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.submitted.emit();
          this.close();
        },
        error: (err) => {
          this.isSubmitting = false;
          if (err?.status === 409) {
            this.submitted.emit();
            this.close();
            return;
          }
          this.error = err?.error?.error || err?.error?.message || 'Impossible d\'enregistrer le feedback.';
        }
      });
  }
}
