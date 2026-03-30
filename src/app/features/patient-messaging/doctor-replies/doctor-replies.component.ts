import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientCommentService } from '../services/patient-comment.service';
import { PrivateMessage } from '../models/patient-messaging.model';

@Component({
  selector: 'app-doctor-replies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-replies.component.html',
  styleUrls: ['./doctor-replies.component.css']
})
export class DoctorRepliesComponent implements OnInit {
  @Input() patientId = 1; // ID du patient actuel
  
  doctorReplies: PrivateMessage[] = [];
  isLoading = false;

  constructor(private patientCommentService: PatientCommentService) {}

  ngOnInit(): void {
    this.loadDoctorReplies();
  }

  loadDoctorReplies(): void {
    this.isLoading = true;
    this.patientCommentService.getDoctorReplies(this.patientId).subscribe({
      next: (replies) => {
        this.doctorReplies = replies;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return new Date(dateStr).toLocaleDateString('fr');
  }

  getReplyContext(reply: PrivateMessage): string {
    if (reply.contentId) {
      return `Réponse concernant l'article #${reply.contentId}`;
    }
    if (reply.commentId) {
      return `Réponse concernant votre commentaire`;
    }
    return 'Réponse privée';
  }
}
