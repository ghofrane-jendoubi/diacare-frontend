import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorEducationService } from '../../services/doctor-education.service';
import { ArticleForm, CATEGORIES, CONTENT_TYPES, DIFFICULTY_LEVELS } from '../../models/doctor-education.model';

@Component({
  selector: 'app-article-editor',
  templateUrl: './article-editor.component.html',
  styleUrls: ['./article-editor.component.css']
})
export class ArticleEditorComponent implements OnInit {

  isEdit = false;
  articleId: number | null = null;
  isSaving = false;
  activePreview = false;
  imageTab: 'url' | 'upload' | 'suggest' | 'unsplash' = 'suggest';
  videoTab: 'youtube' | 'url' = 'youtube';
  imagePreviewError = false;

  // === U N S P L A S H ===
  unsplashQuery = '';
  unsplashResults: any[] = [];
  isSearchingUnsplash = false;
  unsplashKey = 'QtgUQtgFKrOA0MozZTtBLEmT2Wd6mwX2vkLBPB_Dhdo'; // ← Remplacez par votre Access Key

  categories = CATEGORIES;
  contentTypes = CONTENT_TYPES;
  difficultyLevels = DIFFICULTY_LEVELS;

  form: ArticleForm = {
    title: '',
    subtitle: '',
    content: '',
    summary: '',
    category: 'NUTRITION',
    contentType: 'ARTICLE',
    thumbnailUrl: '',
    videoUrl: '',
    tags: '',
    readingTime: 5,
    difficultyLevel: 'BEGINNER',
    isFeatured: false,
    isPublished: true
  };

  imageSuggestions = [
    { url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600', thumb: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100', label: 'Glycémie' },
    { url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600', thumb: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=100', label: 'Nutrition' },
    { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', thumb: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100', label: 'Sport' },
    { url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600', thumb: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100', label: 'Médicaments' },
    { url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600', thumb: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=100', label: 'Surveillance' },
    { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600', thumb: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=100', label: 'Bien-être' },
    { url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600', thumb: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100', label: 'Santé mentale' },
    { url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600', thumb: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100', label: 'Exercice' },
    { url: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600', thumb: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=100', label: 'Fruits & Légumes' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorEducationService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.articleId = Number(id);
      this.isEdit = true;
    }
  }

  // ===== U N S P L A S H   M É T H O D E S =====
  searchUnsplash() {
    if (!this.unsplashQuery.trim()) return;
    this.isSearchingUnsplash = true;
    this.unsplashResults = [];

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(this.unsplashQuery)}&per_page=9&orientation=landscape`;

    this.http.get<any>(url, {
      headers: { Authorization: `Client-ID ${this.unsplashKey}` }
    }).subscribe({
      next: (res) => {
        this.unsplashResults = res.results;
        this.isSearchingUnsplash = false;
        if (this.unsplashResults.length === 0) {
          alert('Aucune image trouvée.');
        }
      },
      error: (err) => {
        console.error('Erreur Unsplash:', err);
        this.isSearchingUnsplash = false;
        if (err.status === 401) {
          alert('Clé API Unsplash invalide. Vérifiez votre clé.');
        } else {
          alert('Erreur lors de la recherche d’images. Vérifiez votre connexion.');
        }
      }
    });
  }

  searchUnsplashByCategory() {
    const queries: Record<string, string> = {
      NUTRITION: 'healthy food diabetes',
      EXERCISE: 'exercise fitness health',
      MEDICATION: 'medicine pills pharmacy',
      MONITORING: 'blood glucose monitoring',
      LIFESTYLE: 'healthy lifestyle wellness',
      MENTAL_HEALTH: 'mental health meditation'
    };
    this.unsplashQuery = queries[this.form.category] || 'health medical';
    this.searchUnsplash();
  }

  selectUnsplashImage(img: any) {
    this.form.thumbnailUrl = img.urls.regular;
    this.imagePreviewError = false;
  }

  // ===== M É T H O D E S   E X I S T A N T E S (inchangées) =====
  onImageFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) { alert('Veuillez sélectionner une image (JPG, PNG, WebP)'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image trop volumineuse. Maximum 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      this.form.thumbnailUrl = e.target?.result as string;
      this.imagePreviewError = false;
    };
    reader.readAsDataURL(file);
  }

  selectSuggestion(url: string) {
    this.form.thumbnailUrl = url;
    this.imagePreviewError = false;
  }

  onImageError() { this.imagePreviewError = true; }

  extractYoutubeId(url: string): string | null {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  onYoutubeLinkChange() {
    const id = this.extractYoutubeId(this.form.videoUrl);
    if (id && !this.form.thumbnailUrl) {
      this.form.thumbnailUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    }
  }

  getYoutubeEmbedUrl(): string {
    const id = this.extractYoutubeId(this.form.videoUrl);
    return id ? `https://www.youtube.com/embed/${id}` : '';
  }

  insertHtml(tag: string) {
    const templates: Record<string, string> = {
      h2: '<h2>Titre de section</h2>\n',
      h3: '<h3>Sous-titre</h3>\n',
      p: '<p>Votre texte ici...</p>\n',
      ul: '<ul>\n  <li>Élément 1</li>\n  <li>Élément 2</li>\n  <li>Élément 3</li>\n</ul>\n',
      blockquote: '<blockquote>Citation ou conseil important pour le patient</blockquote>\n',
      strong: '<p><strong>Point important :</strong> votre texte ici.</p>\n'
    };
    this.form.content += templates[tag] || '';
    this.estimateReadingTime();
  }

  estimateReadingTime() {
    const words = this.form.content.replace(/<[^>]*>/g, '').split(' ').filter(w => w).length;
    this.form.readingTime = Math.max(1, Math.ceil(words / 200));
  }

  get wordCount(): number {
    return this.form.content.replace(/<[^>]*>/g, '').split(' ').filter(w => w).length;
  }

  saveArticle() {
    if (!this.form.title.trim() || !this.form.content.trim()) {
      alert('Le titre et le contenu sont obligatoires');
      return;
    }
    this.isSaving = true;
    const obs = this.isEdit && this.articleId
      ? this.doctorService.updateArticle(this.articleId, this.form)
      : this.doctorService.createArticle(this.form);

    obs.subscribe({
      next: () => {
        alert('Article sauvegardé avec succès !');
        this.router.navigate(['/doctor/education']);
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('Erreur lors de la sauvegarde.');
        this.isSaving = false;
      }
    });
  }

  saveDraft() {
    this.form.isPublished = false;
    this.saveArticle();
  }

  cancel() {
    this.router.navigate(['/doctor/education']);
  }
}