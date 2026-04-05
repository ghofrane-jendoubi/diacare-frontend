export interface DoctorStats {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

export interface ArticleForm {
  title: string;
  subtitle: string;
  content: string;
  summary: string;
  category: string;
  contentType: string;
  thumbnailUrl: string;
  videoUrl: string;
  tags: string;
  readingTime: number;
  difficultyLevel: string;
  isFeatured: boolean;
  isPublished: boolean;
}

export const CATEGORIES = [
  { value: 'NUTRITION', label: 'Nutrition', icon: '🥗' },
  { value: 'EXERCISE', label: 'Exercice', icon: '🏃' },
  { value: 'MEDICATION', label: 'Médicaments', icon: '💊' },
  { value: 'MONITORING', label: 'Surveillance', icon: '📊' },
  { value: 'LIFESTYLE', label: 'Mode de vie', icon: '🌟' },
  { value: 'MENTAL_HEALTH', label: 'Santé mentale', icon: '🧠' }
];

export const CONTENT_TYPES = [
  { value: 'ARTICLE', label: 'Article' },
  { value: 'VIDEO', label: 'Vidéo' },
  { value: 'INFOGRAPHIC', label: 'Infographie' },
  { value: 'QUIZ', label: 'Quiz' }
];

export const DIFFICULTY_LEVELS = [
  { value: 'BEGINNER', label: 'Débutant' },
  { value: 'INTERMEDIATE', label: 'Intermédiaire' },
  { value: 'ADVANCED', label: 'Avancé' }
];