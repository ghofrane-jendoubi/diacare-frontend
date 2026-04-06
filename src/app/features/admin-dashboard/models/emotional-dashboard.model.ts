export interface ContentEmotionStats {
  contentId: number;
  contentTitle: string;
  category: string;
  feedbackCount: number;
  happyCount: number;
  neutralCount: number;
  sadCount: number;
  anxietyRate: number;
}

export interface EmotionalDashboard {
  totalFeedbacks: number;
  happyCount: number;
  neutralCount: number;
  sadCount: number;
  contentStats: ContentEmotionStats[];
}
