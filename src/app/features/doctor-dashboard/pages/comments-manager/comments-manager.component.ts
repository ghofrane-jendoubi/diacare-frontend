import { Component, OnInit } from '@angular/core';
import { DoctorEducationService } from '../../services/doctor-education.service';
import { EducationComment } from '../../../education/models/comment';

@Component({
  selector: 'app-comments-manager',
  templateUrl: './comments-manager.component.html',
  styleUrls: ['./comments-manager.component.css']
})
export class CommentsManagerComponent implements OnInit {

  comments: EducationComment[] = [];
  isLoading = true;
  replyingTo: number | null = null;
  replyText = '';
  privateMessageTo: number | null = null;
  privateMessage = '';
  filter = 'all';

  constructor(private doctorService: DoctorEducationService) {}

  ngOnInit() { this.loadComments(); }

  loadComments() {
    this.isLoading = true;
    this.doctorService.getDoctorComments().subscribe({
      next: (data) => { this.comments = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  startReply(commentId: number) {
    this.replyingTo = commentId;
    this.privateMessageTo = null;
    this.replyText = '';
  }

  submitReply(commentId: number) {
    if (!this.replyText.trim()) return;
    this.doctorService.replyToComment(commentId, this.replyText).subscribe(reply => {
      const comment = this.comments.find(c => c.id === commentId);
      if (comment) {
        if (!comment.replies) comment.replies = [];
        comment.replies.push(reply);
      }
      this.replyingTo = null;
      this.replyText = '';
    });
  }

  startPrivateMessage(commentId: number) {
    this.privateMessageTo = commentId;
    this.replyingTo = null;
    this.privateMessage = '';
  }

  sendPrivateMessage(comment: EducationComment) {
    if (!this.privateMessage.trim()) return;
    this.doctorService.sendPrivateMessage(
      comment.id, comment.userName,
      this.privateMessage, comment.contentId, comment.id
    ).subscribe(() => {
      alert('Message privé envoyé à ' + comment.userName);
      this.privateMessageTo = null;
      this.privateMessage = '';
    });
  }

  deleteComment(commentId: number) {
    if (confirm('Supprimer ce commentaire ?')) {
      this.doctorService.deleteComment(commentId).subscribe(() => {
        this.comments = this.comments.filter(c => c.id !== commentId);
      });
    }
  }

  timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return `il y a ${Math.floor(diff / 86400)}j`;
  }
}