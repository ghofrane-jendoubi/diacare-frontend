export interface PatientFeedback {
  patientId: number;
  patientName: string;
  contentId: number;
  contentTitle: string;
  emotion: 'HAPPY' | 'NEUTRAL' | 'SAD' | string;
  comment?: string | null;
  createdAt: string;
}
