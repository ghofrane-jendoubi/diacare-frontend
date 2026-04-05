import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ForumService } from './forum.service';
import { AuthService } from '../../../../shared/services/auth.service';
import {
  ForumPost,
  ForumComment,
  TopPost,
  TopContributor,
  CategoryCount
} from './forum.model';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit {
  currentUser: any = null;
  posts: ForumPost[] = [];
  isLoading = true;
  selectedCategory = 'ALL';
  currentPage = 0;
  totalPages = 0;

  showNewPost = false;
  newPost = { title: '', content: '', category: 'EXPERIENCE' };
  isPosting = false;
  postError = '';
  postSuccess = '';

  selectedPost: ForumPost | null = null;
  comments: ForumComment[] = [];
  newComment = '';
  isCommenting = false;

  topPosts: TopPost[] = [];
  topContributors: TopContributor[] = [];
  categoryCounts: CategoryCount[] = [];

  // Design moderne
  isSidebarCollapsed = false;
  isMobile = false;
  searchQuery = '';
  showFilters = false;
  selectedCategories: string[] = [];
  activeFiltersCount = 0;
  viewMode = 'grid'; // 'grid' ou 'list'
  userStats = { postCount: 0, likeCount: 0, commentCount: 0 };

  categories = [
    { key: 'ALL', label: 'Tout', icon: '🌐' },
    { key: 'EXPERIENCE', label: 'Expériences', icon: '💬' },
    { key: 'RECETTE', label: 'Recettes', icon: '🍽️' },
    { key: 'ASTUCE', label: 'Astuces', icon: '💡' },
    { key: 'QUESTION', label: 'Questions', icon: '❓' },
    { key: 'MOTIVATION', label: 'Motivation', icon: '💪' }
  ];

  constructor(
    private forumService: ForumService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) this.isSidebarCollapsed = true;

    this.authService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
      if (user) {
        this.loadPosts();
        this.loadSidebarData();
        this.loadUserStats();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  loadSidebarData() {
    this.forumService.getTopLikedPosts(5).subscribe(data => this.topPosts = data);
    this.forumService.getTopContributors(5).subscribe(data => this.topContributors = data);
    this.forumService.getCategoryCounts().subscribe(data => this.categoryCounts = data);
  }

  loadPosts() {
    if (!this.currentUser) return;
    this.isLoading = true;
    const obs = this.selectedCategory === 'ALL'
      ? this.forumService.getPosts(this.currentPage)
      : this.forumService.getPostsByCategory(this.selectedCategory, this.currentPage);

    obs.subscribe({
      next: (data) => {
        this.posts = data.content || data;
        this.totalPages = data.totalPages || 1;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onCategoryChange(cat: string) {
    this.selectedCategory = cat;
    this.currentPage = 0;
    this.loadPosts();
  }

  submitPost() {
    if (!this.currentUser) return;
    if (!this.newPost.title.trim() || !this.newPost.content.trim()) return;
    this.isPosting = true;
    this.postError = '';

    this.forumService.createPost({
      title: this.newPost.title,
      content: this.newPost.content,
      category: this.newPost.category,
      patientId: this.currentUser.id,
      patientName: this.currentUser.name
    }).subscribe({
      next: (res) => {
        this.isPosting = false;
        if (res.blocked) {
          this.postError = '⚠️ Publication bloquée par la modération IA : ' + res.reason;
        } else {
          this.postSuccess = '✅ Publication partagée avec la communauté !';
          this.newPost = { title: '', content: '', category: 'EXPERIENCE' };
          this.showNewPost = false;
          this.loadPosts();
          this.loadSidebarData();
          setTimeout(() => this.postSuccess = '', 3000);
        }
      },
      error: () => {
        this.isPosting = false;
        this.postError = 'Erreur de connexion';
      }
    });
  }

  openPost(post: ForumPost) {
    this.selectedPost = post;
    this.forumService.getComments(post.id).subscribe({
      next: (data) => this.comments = data,
      error: () => this.comments = []
    });
  }

  openPostFromId(postId: number) {
    const existingPost = this.posts.find(p => p.id === postId);
    if (existingPost) {
      this.openPost(existingPost);
    } else {
      this.forumService.getPostById(postId).subscribe({
        next: (post) => this.openPost(post),
        error: () => console.error('Impossible de charger le post')
      });
    }
  }

  closePost() {
    this.selectedPost = null;
    this.comments = [];
    this.newComment = '';
  }

  toggleLike(post: ForumPost, event: Event) {
    event.stopPropagation();
    if (!this.currentUser) return;
    this.forumService.toggleLike(post.id, this.currentUser.id).subscribe(res => {
      post.isLiked = res.liked;
      post.likeCount += res.liked ? 1 : -1;
      this.loadSidebarData();
    });
  }

  submitComment() {
    if (!this.currentUser || !this.selectedPost) return;
    if (!this.newComment.trim()) return;
    this.isCommenting = true;

    this.forumService.addComment(this.selectedPost.id, {
      content: this.newComment,
      patientId: this.currentUser.id,
      patientName: this.currentUser.name
    }).subscribe({
      next: (res) => {
        this.isCommenting = false;
        if (res.blocked) {
          alert('⚠️ Commentaire bloqué : ' + res.reason);
        } else {
          this.comments.push(res.comment);
          this.selectedPost!.commentCount++;
          this.newComment = '';
          this.loadSidebarData();
        }
      },
      error: (err) => {
        this.isCommenting = false;
        console.error('Erreur commentaire', err);
        alert('Erreur lors de l\'ajout du commentaire');
      }
    });
  }

  deletePost(post: ForumPost, event: Event) {
    event.stopPropagation();
    if (!this.currentUser || post.patientId !== this.currentUser.id) return;
    if (!confirm('Supprimer cette publication ?')) return;
    this.forumService.deletePost(post.id, this.currentUser.id).subscribe(() => {
      this.posts = this.posts.filter(p => p.id !== post.id);
      this.loadSidebarData();
    });
  }

  getAvatarLetter(name: string): string {
    return name ? name.charAt(0).toUpperCase() : 'P';
  }

  timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return `il y a ${Math.floor(diff / 86400)}j`;
  }

  getCategoryIcon(cat: string): string {
    const icons: Record<string, string> = {
      EXPERIENCE: '💬', RECETTE: '🍽️',
      ASTUCE: '💡', QUESTION: '❓', MOTIVATION: '💪'
    };
    return icons[cat] || '📝';
  }

  getCategoryLabel(cat: string): string {
    const labels: Record<string, string> = {
      EXPERIENCE: 'Expériences', RECETTE: 'Recettes',
      ASTUCE: 'Astuces', QUESTION: 'Questions', MOTIVATION: 'Motivation'
    };
    return labels[cat] || cat;
  }

  // Méthodes pour le design moderne
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  performSearch() {
    if (!this.searchQuery.trim()) {
      this.loadPosts();
      return;
    }
    this.isLoading = true;
    this.forumService.searchPosts(this.searchQuery, this.currentPage).subscribe({
      next: (data) => {
        this.posts = data.content || data;
        this.totalPages = data.totalPages || 1;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  toggleCategoryFilter(categoryKey: string) {
    const index = this.selectedCategories.indexOf(categoryKey);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(categoryKey);
    }
  }

  applyFilters() {
    this.activeFiltersCount = this.selectedCategories.length;
    if (this.selectedCategories.length === 0) {
      this.loadPosts();
    } else {
      this.isLoading = true;
      // Simuler un appel API de filtrage multiple
      this.forumService.getPosts(this.currentPage).subscribe({
        next: (data) => {
          const allPosts = data.content || data;
          this.posts = allPosts.filter((post: ForumPost) =>
            this.selectedCategories.includes(post.category)
          );
          this.totalPages = 1;
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  resetFilters() {
    this.selectedCategories = [];
    this.searchQuery = '';
    this.showFilters = false;
    this.activeFiltersCount = 0;
    this.loadPosts();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadPosts();
  }

  sharePost(post: ForumPost, event: Event) {
    event.stopPropagation();
    const link = `${window.location.origin}/patient/forum/post/${post.id}`;
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: link
      }).catch(() => this.copyToClipboard(link));
    } else {
      this.copyToClipboard(link);
    }
  }

  private copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('Lien copié dans le presse-papiers !');
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.isSidebarCollapsed = true;
    }
  }

  loadUserStats() {
    // À remplacer par un vrai appel API si disponible
    this.userStats = {
      postCount: Math.floor(Math.random() * 20),
      likeCount: Math.floor(Math.random() * 100),
      commentCount: Math.floor(Math.random() * 50)
    };
  }
}