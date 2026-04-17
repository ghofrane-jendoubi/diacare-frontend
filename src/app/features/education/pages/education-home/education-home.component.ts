import { Component, OnInit, HostListener } from '@angular/core';
import { EducationService } from '../../services/education.service';
import { Router } from '@angular/router';
import { ContentSummary, ContentCategory, CATEGORY_LABELS, CATEGORY_ICONS } from '../../models/content';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-education-home',
  templateUrl: './education-home.component.html',
  styleUrls: ['./education-home.component.css']
})
export class EducationHomeComponent implements OnInit {

  articles: ContentSummary[] = [];
  featuredArticles: ContentSummary[] = [];
  mostViewed: ContentSummary[] = [];
  recommendedArticles: ContentSummary[] = [];
  isLoading = true;
  searchQuery = '';
  selectedCategory: ContentCategory | '' = '';
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 9;
  activeTab: 'all' | 'featured' | 'bookmarks' = 'all';

  // Propriétés pour le navbar
  isScrolled = false;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  activeSection: string = '';
  isLoggedIn = true;

  // Menu items pour le navbar
  menuItems = [
    { id: 'accueil', label: 'Accueil', link: '/patient/home' },
    { id: 'services', label: 'Services', link: '/patient/education' },
    { id: 'comment-ca-marche', label: 'Comment ça marche', link: '#comment-ca-marche' },
    { id: 'temoignages', label: 'Témoignages', link: '/temoignages' },
    { id: 'contact', label: 'Contact', link: '/contact' }
  ];

  categories = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    key: key as ContentCategory,
    label,
    icon: CATEGORY_ICONS[key as ContentCategory]
  }));

  constructor(
    private educationService: EducationService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFeatured();
    this.loadMostViewed();
    this.loadRecommendations();
    this.loadArticles();
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  scrollTo(sectionId: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    if (sectionId.startsWith('#')) {
      const element = document.getElementById(sectionId.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      this.router.navigate([sectionId]);
    }
    
    this.activeSection = sectionId;
    this.isMobileMenuOpen = false;
  }

  // ✅ Propriété pour l'avatar
  get avatarLetter(): string {
    const user = this.auth.getCurrentUser();
    if (user && user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return 'SM';
  }

  getUserInitial(): string {
    return this.avatarLetter;
  }

  getUserName(): string {
    const user = this.auth.getCurrentUser();
    if (user) {
      return `${user.firstName} ${user.lastName}`.trim();
    }
    return 'Sophie Martin';
  }

  getUserEmail(): string {
    const user = this.auth.getCurrentUser();
    return user?.email || 'sophie.martin@example.com';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  get currentUserName(): string {
    return this.getUserName();
  }

  get currentUserFirstName(): string {
    const user = this.auth.getCurrentUser();
    return user?.firstName || 'Sophie';
  }

  loadFeatured() {
    this.educationService.getFeatured().subscribe({
      next: data => this.featuredArticles = data,
      error: () => this.featuredArticles = []
    });
  }

  loadMostViewed() {
    this.educationService.getMostViewed().subscribe({
      next: data => this.mostViewed = data,
      error: () => this.mostViewed = []
    });
  }

  loadRecommendations() {
    const user = this.auth.getCurrentUser();
    const userId = user?.id;
    const diabetesType = user?.diabetesType;

    this.educationService.getRecommendations(userId, diabetesType).subscribe({
      next: data => this.recommendedArticles = data,
      error: () => this.recommendedArticles = []
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

    obs.subscribe({
      next: (res) => {
        this.articles = res.content;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement articles:', err);
        this.isLoading = false;
      }
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