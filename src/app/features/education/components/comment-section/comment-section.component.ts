import { Component, Input, OnInit } from '@angular/core';
import { EducationService } from '../../services/education.service';
import { EducationComment } from '../../models/comment';

@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.css']
})
export class CommentSectionComponent implements OnInit {
  @Input() contentId!: number;
  @Input() commentCount = 0;

  comments: EducationComment[] = [];  // ← EducationComment au lieu de Comment
  newComment = '';
  isSubmitting = false;
  isLoading = true;

  constructor(private educationService: EducationService) {}

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    this.educationService.getComments(this.contentId).subscribe(data => {
      this.comments = data;
      this.isLoading = false;
    });
  }

  submitComment() {
    if (!this.newComment.trim()) return;
    this.isSubmitting = true;
    this.educationService.addComment(this.contentId, this.newComment).subscribe(comment => {
      this.comments.unshift(comment);
      this.newComment = '';
      this.isSubmitting = false;
    });
  }

  timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return `il y a ${Math.floor(diff / 86400)} jour(s)`;
  }
}