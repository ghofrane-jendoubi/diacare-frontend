export interface ForumPost {
  id: number;
  title: string;
  content: string;
  category: string;
  patientId: number;
  patientName: string;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  isModerated?: boolean;
  createdAt: string;
}

export interface ForumComment {
  id: number;
  content: string;
  patientId: number;
  patientName: string;
  createdAt: string;
}

export interface TopPost {
  id: number;
  title: string;
  likeCount: number;
  commentCount: number;
}

export interface TopContributor {
  patientId: number;
  patientName: string;
  postCount: number;
  commentCount: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}