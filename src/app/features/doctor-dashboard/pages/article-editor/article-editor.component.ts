import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DoctorEducationService } from '../../services/doctor-education.service';
import { ArticleForm, CATEGORIES, CONTENT_TYPES, DIFFICULTY_LEVELS } from '../../models/doctor-education.model';

declare var webkitSpeechRecognition: any;

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

  // Unsplash
  unsplashQuery = '';
  unsplashResults: any[] = [];
  isSearchingUnsplash = false;
  unsplashKey = 'QtgUQtgFKrOA0MozZTtBLEmT2Wd6mwX2vkLBPB_Dhdo'; // ← Votre clé

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

  // ===== SPEECH-TO-TEXT =====
  recognition: any;
  isListening = false;
  activeField: 'title' | 'subtitle' | 'summary' | 'content' | null = null;

  // ===== IA MAISON =====
  isGeneratingSummary = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorEducationService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.articleId = Number(id);
      this.isEdit = true;
    }
    if (isPlatformBrowser(this.platformId)) {
      this.initSpeechRecognition();
    }
  }

  // ===== INITIALISATION RECONNAISSANCE VOCALE =====
  initSpeechRecognition() {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      console.warn('La reconnaissance vocale n’est pas supportée par ce navigateur.');
      return;
    }
    this.recognition = new webkitSpeechRecognition();
    this.recognition.lang = 'fr-FR';
    this.recognition.interimResults = true;
    this.recognition.continuous = true;

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      if (this.activeField) {
        this.form[this.activeField] = transcript;
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Erreur reconnaissance vocale:', event.error);
      this.stopListening();
      alert('Erreur de reconnaissance vocale. Veuillez réessayer.');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.activeField = null;
    };
  }

  startListening(field: 'title' | 'subtitle' | 'summary' | 'content') {
    if (!this.recognition) {
      alert('La reconnaissance vocale n’est pas supportée par votre navigateur.');
      return;
    }
    if (this.isListening) {
      this.stopListening();
    }
    this.activeField = field;
    this.isListening = true;
    this.recognition.start();
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    this.isListening = false;
    this.activeField = null;
  }

  // ===== IA MAISON : RÉSUMÉ EXTRACTIF =====
  async onGenerateCustomSummary() {
    if (this.isGeneratingSummary) return;
    this.isGeneratingSummary = true;
    try {
      const summary = await this.generateCustomSummary();
      this.form.summary = summary;
    } catch (error: any) {
      console.error('Erreur de génération du résumé:', error);
      alert(error.message || 'Impossible de générer le résumé.');
    } finally {
      this.isGeneratingSummary = false;
    }
  }

  /**
   * Génère un résumé du contenu de l'article en utilisant un algorithme extractif.
   * Retourne une promesse avec le résumé.
   */
  async generateCustomSummary(): Promise<string> {
    const content = this.form.content;
    if (!content || content.trim().length < 50) {
      throw new Error('Le contenu est trop court pour générer un résumé (minimum 50 caractères).');
    }

    // 1. Nettoyer le HTML
    const plainText = content.replace(/<[^>]*>/g, '').trim();

    // 2. Découper en phrases
    const sentences = this.splitIntoSentences(plainText);
    if (sentences.length < 2) {
      throw new Error('Le texte ne contient pas assez de phrases pour un résumé.');
    }

    // 3. Compter les mots (sans stop words)
    const wordFreq = this.computeWordFrequencies(plainText);

    // 4. Noter chaque phrase
    const scoredSentences = sentences.map(sentence => ({
      text: sentence,
      score: this.scoreSentence(sentence, wordFreq)
    }));

    // 5. Sélectionner les N meilleures phrases (par ex. 3)
    const summarySentenceCount = Math.min(3, Math.ceil(sentences.length / 3));
    const topSentences = this.selectTopSentences(scoredSentences, summarySentenceCount);

    // 6. Reconstruire le résumé dans l'ordre original
    const summary = topSentences.map(s => s.text).join(' ');
    return summary;
  }

  /**
   * Découpe un texte en phrases (basé sur . ! ?)
   */
  private splitIntoSentences(text: string): string[] {
    return text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  }

  /**
   * Calcule la fréquence d'apparition des mots (sans stop words).
   */
  private computeWordFrequencies(text: string): Map<string, number> {
    const stopWords = new Set([
      'le', 'la', 'les', 'de', 'des', 'du', 'un', 'une', 'et', 'ou', 'mais', 'donc', 'car', 'ni',
      'ce', 'cette', 'ces', 'cet', 'il', 'elle', 'ils', 'elles', 'on', 'nous', 'vous', 'je', 'tu',
      'me', 'te', 'se', 'lui', 'leur', 'y', 'en', 'a', 'dans', 'par', 'pour', 'sur', 'sous', 'avec',
      'sans', 'contre', 'vers', 'chez', 'entre', 'pendant', 'depuis', 'avant', 'après', 'dès',
      'jusque', 'hormis', 'sauf', 'selon', 'dont', 'où', 'quand', 'comment', 'pourquoi', 'que',
      'qui', 'quoi', 'quel', 'quelle', 'quels', 'quelles', 'est', 'sont', 'être', 'avoir', 'faire'
    ]);

    const words = text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève accents
      .match(/\b[a-z0-9]{3,}\b/g) || [];

    const freq = new Map<string, number>();
    for (const w of words) {
      if (!stopWords.has(w)) {
        freq.set(w, (freq.get(w) || 0) + 1);
      }
    }
    return freq;
  }

  /**
   * Calcule le score d'une phrase (somme des fréquences de ses mots).
   */
  private scoreSentence(sentence: string, wordFreq: Map<string, number>): number {
    const words = sentence.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .match(/\b[a-z0-9]{3,}\b/g) || [];
    let score = 0;
    for (const w of words) {
      score += wordFreq.get(w) || 0;
    }
    return score / (words.length || 1); // normalisation par longueur
  }

  /**
   * Sélectionne les N meilleures phrases en fonction de leur score.
   */
  private selectTopSentences(scored: Array<{ text: string, score: number }>, n: number): Array<{ text: string, score: number }> {
    // Trier par score décroissant
    const sorted = [...scored].sort((a, b) => b.score - a.score);
    // Prendre les N meilleures
    const top = sorted.slice(0, n);
    // Les remettre dans l'ordre d'apparition
    const indices = new Map<string, number>();
    scored.forEach((s, idx) => indices.set(s.text, idx));
    top.sort((a, b) => (indices.get(a.text) || 0) - (indices.get(b.text) || 0));
    return top;
  }

  // ===== U N S P L A S H =====
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

  // ===== MÉTHODES IMAGE =====
  onImageFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop volumineuse. Maximum 5 MB.');
      return;
    }
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

  onImageError() {
    this.imagePreviewError = true;
  }

  // ===== YOUTUBE =====
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

  // ===== TOOLBAR =====
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

  // ===== SAUVEGARDE =====
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