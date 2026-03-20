import { EducationComment } from './comment';

export interface ContentSummary {
  id: number;
  title: string;
  summary: string;
  category: ContentCategory;
  contentType: ContentType;
  thumbnailUrl: string;
  authorName: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  readingTime: number;
  difficultyLevel: DifficultyLevel;
  isFeatured: boolean;
  tags: string;
  createdAt: string;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface ContentDetail extends ContentSummary {
  subtitle: string;
  content: string;
  videoUrl: string;
  comments: EducationComment[];   // ← EducationComment au lieu de Comment
}

export type ContentCategory =
  'NUTRITION' | 'EXERCISE' | 'MEDICATION' |
  'MONITORING' | 'LIFESTYLE' | 'MENTAL_HEALTH';

export type ContentType = 'ARTICLE' | 'VIDEO' | 'INFOGRAPHIC' | 'QUIZ';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const CATEGORY_LABELS: Record<ContentCategory, string> = {
  NUTRITION: 'Nutrition',
  EXERCISE: 'Exercice',
  MEDICATION: 'Médicaments',
  MONITORING: 'Surveillance',
  LIFESTYLE: 'Mode de vie',
  MENTAL_HEALTH: 'Santé mentale'
};

export const CATEGORY_ICONS: Record<ContentCategory, string> = {
  NUTRITION: '🥗',
  EXERCISE: '🏃',
  MEDICATION: '💊',
  MONITORING: '📊',
  LIFESTYLE: '🌟',
  MENTAL_HEALTH: '🧠'
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé'
};