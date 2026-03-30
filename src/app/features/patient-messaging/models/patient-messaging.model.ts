export interface PrivateMessage {
  id: number;
  senderId: number;
  receiverId: number;
  senderName: string;
  receiverName: string;
  message: string;
  contentId?: number;
  commentId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface MessageResponse {
  sent: PrivateMessage[];
  received: PrivateMessage[];
}
