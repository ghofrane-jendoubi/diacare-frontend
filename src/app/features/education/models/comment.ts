export interface EducationComment {
  id: number;
  contentId: number;
  userName: string;
  userAvatar?: string;
  commentText: string;
  parentCommentId?: number;
  likeCount: number;
  createdAt: string;
  replies?: EducationComment[];
}