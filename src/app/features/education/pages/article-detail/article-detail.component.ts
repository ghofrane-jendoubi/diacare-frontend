import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { EducationService } from '../../services/education.service';
import { ContentDetail, CATEGORY_LABELS, CATEGORY_ICONS, DIFFICULTY_LABELS } from '../../models/content';
import { QuizService, QuizQuestion } from '../../services/quiz.service';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent implements OnInit {

  article: ContentDetail | null = null;
  isLoading = true;
  newComment = '';
  isSubmittingComment = false;
  categoryLabels = CATEGORY_LABELS;
  categoryIcons = CATEGORY_ICONS;
  difficultyLabels = DIFFICULTY_LABELS;

  // ===== TRADUCTION =====
  showTranslation = false;
  translatedContent = '';
  targetLang = 'ar';
  isTranslating = false;

  // ===== LECTURE VOCALE =====
  isReading = false;
  utterance: SpeechSynthesisUtterance | null = null;

  // ===== QUIZ =====
  quizQuestions: QuizQuestion[] = [];
  quizAnswers: { [key: number]: string } = {};
  quizSubmitted = false;
  quizScore = 0;
  showQuiz = false;

  constructor(
    private route: ActivatedRoute,
    private educationService: EducationService,
    private http: HttpClient,
    private quizService: QuizService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.educationService.getContentDetail(id).subscribe({
      next: (data) => {
        this.article = data;
        this.isLoading = false;
        this.generateQuiz(); // Générer le quiz après chargement
      },
      error: (err) => {
        console.error('Erreur chargement article:', err);
        this.isLoading = false;
      }
    });
  }

  // ===== YOUTUBE =====
  isYoutubeUrl(url: string): boolean {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  getYoutubeEmbedUrl(url: string): string {
    if (!url) return '';
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  }

  // ===== TRADUCTION =====
  translateArticle() {
    if (!this.article?.content) {
      alert('Aucun contenu à traduire');
      return;
    }
    this.isTranslating = true;
    this.showTranslation = true;

    const textToTranslate = this.article.content.replace(/<[^>]*>/g, '');

    this.http.post<any>('https://libretranslate.com/translate', {
      q: textToTranslate,
      source: 'fr',
      target: this.targetLang,
      format: 'text'
    }).subscribe({
      next: (res) => {
        this.translatedContent = res.translatedText;
        this.isTranslating = false;
      },
      error: () => {
        const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate.substring(0, 500))}&langpair=fr|${this.targetLang}`;
        this.http.get<any>(myMemoryUrl).subscribe({
          next: (res) => {
            this.translatedContent = res.responseData.translatedText;
            this.isTranslating = false;
          },
          error: (err) => {
            console.error('Erreur traduction:', err);
            this.isTranslating = false;
            alert('Erreur de traduction. Veuillez réessayer plus tard.');
          }
        });
      }
    });
  }

  // ===== LECTURE VOCALE =====
  startReading() {
    if (!this.article?.content) return;
    const text = this.article.content.replace(/<[^>]*>/g, '');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.utterance = new SpeechSynthesisUtterance(text);
      this.utterance.lang = 'fr-FR';
      this.utterance.rate = 0.9;
      this.utterance.pitch = 1;

      this.utterance.onstart = () => { this.isReading = true; };
      this.utterance.onend = () => { this.isReading = false; };
      this.utterance.onerror = () => {
        this.isReading = false;
        alert('Erreur de synthèse vocale.');
      };
      window.speechSynthesis.speak(this.utterance);
    } else {
      alert('La synthèse vocale n\'est pas supportée par votre navigateur.');
    }
  }

  stopReading() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isReading = false;
    }
  }

  // ===== QUIZ =====
  private generateQuiz() {
    if (this.article?.content) {
      this.quizQuestions = this.quizService.generateQuiz(this.article.content);
    }
  }

  submitQuiz() {
    let correct = 0;
    for (let i = 0; i < this.quizQuestions.length; i++) {
      const userAnswer = this.quizAnswers[i];
      if (userAnswer === this.quizQuestions[i].correctAnswer) {
        correct++;
      }
    }
    this.quizScore = correct;
    this.quizSubmitted = true;
  }

  resetQuiz() {
    this.quizAnswers = {};
    this.quizSubmitted = false;
    this.quizScore = 0;
  }

  isQuizComplete(): boolean {
    return this.quizQuestions.length > 0 && Object.keys(this.quizAnswers).length === this.quizQuestions.length;
  }

  // ===== ACTIONS EXISTANTES =====
  onLike() {
    if (!this.article) return;
    this.educationService.toggleLike(this.article.id).subscribe({
      next: (res) => {
        this.article!.isLiked = res.liked;
        this.article!.likeCount += res.liked ? 1 : -1;
      },
      error: (err) => console.error('Erreur like:', err)
    });
  }

  onBookmark() {
    if (!this.article) return;
    this.educationService.toggleBookmark(this.article.id).subscribe({
      next: (res) => {
        this.article!.isBookmarked = res.bookmarked;
        const msg = res.bookmarked
          ? '✅ Article sauvegardé !'
          : '🗑️ Article retiré des favoris';
        this.showToast(msg);
      },
      error: (err) => console.error('Erreur bookmark:', err)
    });
  }

  onShare() {
    if (navigator.share) {
      navigator.share({
        title: this.article?.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.showToast('🔗 Lien copié dans le presse-papier !');
    }
  }

  submitComment() {
    if (!this.newComment.trim() || !this.article) return;
    this.isSubmittingComment = true;

    const userName = this.authService.currentUser?.name || 'Patient DiaCare';

    this.educationService.addComment(this.article.id, this.newComment, undefined, userName).subscribe({
      next: (comment) => {
        if (!this.article!.comments) this.article!.comments = [];
        this.article!.comments.unshift(comment);
        this.article!.commentCount++;
        this.newComment = '';
        this.isSubmittingComment = false;
      },
      error: (err) => {
        console.error('Erreur commentaire:', err);
        this.isSubmittingComment = false;
      }
    });
  }

  formatCount(count: number): string {
    if (!count) return '0';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
  }

  showToast(message: string) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; bottom: 28px; right: 28px;
      background: #1e293b; color: white;
      padding: 12px 20px; border-radius: 10px;
      font-size: 14px; font-weight: 500;
      z-index: 99999; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2500);
  }
}