import { Component, OnInit } from '@angular/core';
import { EducationService } from '../../services/education.service';
import { ContentSummary } from '../../models/content';

@Component({
  selector: 'app-my-bookmarks',
  templateUrl: './my-bookmarks.component.html',
  styleUrls: ['./my-bookmarks.component.css']
})
export class MyBookmarksComponent implements OnInit {

  bookmarks: ContentSummary[] = [];
  isLoading = true;
  filter: 'all' | 'article' | 'video' = 'all';

  constructor(private educationService: EducationService) {}

  ngOnInit() {
    this.loadBookmarks();
  }

  loadBookmarks() {
    this.isLoading = true;
    console.log('📚 Chargement des favoris...');

    this.educationService.getMyBookmarks(1).subscribe({
      next: (data) => {
        console.log('✅ Favoris reçus:', data);
        this.bookmarks = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur favoris:', err);
        this.isLoading = false;
      }
    });
  }

  get filteredBookmarks(): ContentSummary[] {
    if (this.filter === 'all') return this.bookmarks;
    return this.bookmarks.filter(b =>
      b.contentType.toLowerCase() === this.filter);
  }

  get articleCount(): number {
    return this.bookmarks.filter(b => b.contentType === 'ARTICLE').length;
  }

  get videoCount(): number {
    return this.bookmarks.filter(b => b.contentType === 'VIDEO').length;
  }

  onBookmarkRemoved(articleId: number) {
    this.bookmarks = this.bookmarks.filter(b => b.id !== articleId);
  }
}