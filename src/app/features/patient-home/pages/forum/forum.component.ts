import { Component, OnInit } from '@angular/core';
import { ForumService, ForumPost, ForumComment } from '../../services/forum.service';
import { AuthService, CurrentUser } from '../../../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent implements OnInit {

  currentUser: CurrentUser | null = null;
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
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadPosts();
      } else {
        this.router.navigate(['/login']);
      }
    });
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
    });
  }

  submitComment() {
    if (!this.currentUser || !this.selectedPost) return;
    if (!this.newComment.trim()) return;
    
    console.log('💬 Ajout commentaire - Utilisateur:', {
      id: this.currentUser.id,
      name: this.currentUser.name,
      email: this.currentUser.email
    });

    // Vérifier que l'ID existe
    if (!this.currentUser.id) {
      this.isCommenting = false;
      alert('⚠️ Erreur: ID utilisateur manquant. Veuillez vous reconnecter.');
      return;
    }

    this.isCommenting = true;

    this.forumService.addComment(this.selectedPost.id, {
      content: this.newComment,
      patientId: this.currentUser.id,
      patientName: this.currentUser.name
    }).subscribe({
      next: (res) => {
        this.isCommenting = false;
        console.log('✅ Réponse commentaire:', res);
        if (res.blocked) {
          alert('⚠️ Commentaire bloqué : ' + res.reason);
        } else {
          this.comments.push(res.comment);
          this.selectedPost!.commentCount++;
          this.newComment = '';
          console.log('💾 Commentaire ajouté avec succès');
        }
      },
      error: (err) => {
        this.isCommenting = false;
        console.error('❌ Erreur lors de l\'ajout du commentaire:', err);
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
}