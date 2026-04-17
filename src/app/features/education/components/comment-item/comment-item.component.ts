import { Component, Input } from '@angular/core';
import { EducationComment } from '../../models/comment';
import { EducationService } from '../../services/education.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-comment-item',
  templateUrl: './comment-item.component.html',
  styleUrls: ['./comment-item.component.css']
})
export class CommentItemComponent {

  @Input() comment!: EducationComment;
  @Input() contentId!: number;

  showReplyForm = false;
  replyText = '';

  constructor(
    private educationService: EducationService,
    private authService: AuthService
  ) {}

  // Helper pour récupérer le nom de l'utilisateur
  private getUserName(): string {
    const user = this.authService.getCurrentUser();
    if (user) {
      return `${user.firstName} ${user.lastName}`.trim();
    }
    return 'Patient DiaCare';
  }

  submitReply() {
    if (!this.replyText.trim()) return;

    const userName = this.getUserName();

    this.educationService.addComment(this.contentId, this.replyText, this.comment.id, userName)
      .subscribe({
        next: (reply) => {
          if (!this.comment.replies) this.comment.replies = [];
          this.comment.replies.push(reply);
          this.replyText = '';
          this.showReplyForm = false;
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout du commentaire:', err);
        }
      });
  }

  timeAgo(dateStr: string): string {
    if (!dateStr) return 'à l\'instant';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'à l\'instant';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return `il y a ${Math.floor(diff / 86400)}j`;
  }
}