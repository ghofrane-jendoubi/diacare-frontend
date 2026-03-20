import { Component, OnInit } from '@angular/core';
import { EducationService } from '../../services/education.service';
import { ContentSummary, ContentCategory, CATEGORY_LABELS, CATEGORY_ICONS } from '../../models/content';

@Component({
  selector: 'app-education-home',
  templateUrl: './education-home.component.html',
  styleUrls: ['./education-home.component.css']
})
export class EducationHomeComponent implements OnInit {

  articles: ContentSummary[] = [];
  featuredArticles: ContentSummary[] = [];
  mostViewed: ContentSummary[] = [];
  isLoading = true;
  searchQuery = '';
  selectedCategory: ContentCategory | '' = '';
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 9;
  activeTab: 'all' | 'featured' | 'bookmarks' = 'all';

  categories = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    key: key as ContentCategory,
    label,
    icon: CATEGORY_ICONS[key as ContentCategory]
  }));

  constructor(private educationService: EducationService) {}

  ngOnInit() {
    this.loadFeatured();
    this.loadMostViewed();
    this.loadArticles();
  }

  loadFeatured() {
    this.educationService.getFeatured().subscribe(data => {
      this.featuredArticles = data;
    });
  }

  loadMostViewed() {
    this.educationService.getMostViewed().subscribe(data => {
      this.mostViewed = data;
    });
  }

  loadArticles() {
    this.isLoading = true;
    let obs;

    if (this.searchQuery.trim()) {
      obs = this.educationService.search(this.searchQuery, this.currentPage, this.pageSize);
    } else if (this.selectedCategory) {
      obs = this.educationService.getByCategory(this.selectedCategory, this.currentPage, this.pageSize);
    } else {
      obs = this.educationService.getAllContents(this.currentPage, this.pageSize);
    }

    obs.subscribe(res => {
      this.articles = res.content;
      this.totalPages = res.totalPages;
      this.totalElements = res.totalElements;
      this.isLoading = false;
    });
  }

  onSearch() {
    this.currentPage = 0;
    this.selectedCategory = '';
    this.loadArticles();
  }

  onCategorySelect(category: ContentCategory | '') {
    this.selectedCategory = category;
    this.currentPage = 0;
    this.searchQuery = '';
    this.loadArticles();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadArticles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}