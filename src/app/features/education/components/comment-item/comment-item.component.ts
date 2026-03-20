import { Component, Input } from '@angular/core';
import { EducationComment } from '../../models/comment';
import { EducationService } from '../../services/education.service';

@Component({
  selector: 'app-comment-item',
  templateUrl: './comment-item.component.html',
  styleUrls: ['./comment-item.component.css']
})
export class CommentItemComponent {

  @Input() comment!: EducationComment;  // ← EducationComment au lieu de Comment
  @Input() contentId!: number;

  showReplyForm = false;
  replyText = '';

  constructor(private educationService: EducationService) {}

  submitReply() {
    if (!this.replyText.trim()) return;
    this.educationService.addComment(this.contentId, this.replyText, this.comment.id)
      .subscribe(reply => {
        if (!this.comment.replies) this.comment.replies = [];
        this.comment.replies.push(reply);
        this.replyText = '';
        this.showReplyForm = false;
      });
  }

  timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return `il y a ${Math.floor(diff / 86400)}j`;
  }
}