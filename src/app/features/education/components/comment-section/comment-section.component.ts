import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EducationComment } from '../../models/comment';
import { EducationService } from '../../services/education.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.css']
})
export class CommentSectionComponent implements OnInit {
  @Input() contentId!: number;
  @Input() commentCount = 0;

  comments: EducationComment[] = [];  
  newComment = '';
  isSubmitting = false;
  isLoading = false;

  constructor(
    private educationService: EducationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadComments();
  }

  // Helper pour récupérer le nom de l'utilisateur
  private getUserName(): string {
    const user = this.authService.getCurrentUser();
    if (user) {
      return `${user.firstName} ${user.lastName}`.trim();
    }
    return 'Patient DiaCare';
  }

  loadComments(): void {
    if (!this.contentId) return;
    
    this.isLoading = true;
    this.educationService.getComments(this.contentId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement commentaires:', err);
        this.isLoading = false;
      }
    });
  }

  submitComment(): void {
    if (!this.newComment.trim() || !this.contentId) return;
    
    this.isSubmitting = true;

    const userName = this.getUserName();

    this.educationService.addComment(this.contentId, this.newComment, undefined, userName).subscribe({
      next: (comment) => {
        this.comments.unshift(comment);
        this.newComment = '';
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Erreur ajout commentaire:', err);
        this.isSubmitting = false;
        alert('Erreur lors de la publication du commentaire');
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
    return `il y a ${Math.floor(diff / 86400)} jour(s)`;
  }
}