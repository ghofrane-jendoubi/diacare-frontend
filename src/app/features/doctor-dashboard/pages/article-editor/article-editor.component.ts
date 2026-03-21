import { Component, OnInit } from '@angular/core';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorEducationService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.articleId = Number(id);
      this.isEdit = true;
    }
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
        alert('Erreur lors de la sauvegarde. Vérifiez que le backend est démarré.');
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

  estimateReadingTime() {
    const words = this.form.content.replace(/<[^>]*>/g, '').split(' ').filter(w => w).length;
    this.form.readingTime = Math.max(1, Math.ceil(words / 200));
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

  get wordCount(): number {
    return this.form.content.replace(/<[^>]*>/g, '').split(' ').filter(w => w).length;
  }
}