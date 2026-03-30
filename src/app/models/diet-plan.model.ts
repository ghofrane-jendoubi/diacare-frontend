export interface FoodAnalysisResult {
  foods: FoodItem[];
  rawText: string;
  analysisDate?: string;
}

export interface FoodItem {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  sugar?: number;
}

export interface FoodEntry {
  id?: number;
  text: string;
  analysisResult?: string;
  patientId?: number;
  createdAt?: string;
  parsedResult?: FoodAnalysisResult;
}

export interface DietPlan {
  id?: number;
  title: string;
  description?: string;
  status?: string;
  targetCalories?: number;
  targetCarbs?: number;
  targetProtein?: number;
  targetFat?: number;
  createdAt?: string;
  meals?: DietMeal[];
  patient?: any;        // ← objet User
  nutritionist?: any;   // ← objet User
}

export interface DietMeal {
  id?: number;
  mealType: string;
  food: string;
  targetCarbs?: number;
  calories?: number;    // ← gardé pour compatibilité
  notes?: string;
  dietPlan?: any;
}
// ==================== NOUVELLES INTERFACES POUR PATIENT-LIST ====================
// Ces interfaces sont ajoutées sans modifier les interfaces existantes

export interface Patient {
  id: number;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  age: number;
  weight: number;
  height: number;
  bmi: number;
  diabetesType: string;
  hba1c: number;
  lastVisit: Date;
  nextAppointment: Date;
  status: 'active' | 'warning' | 'good';
  glucoseLevel: number;
  phone?: string;
  profilePicture?: string;
  nutritionProfile?: PatientNutritionProfile;
}

export interface PatientNutritionProfile {
  id: number;
  userId: number; // correspond à patientId côté backend
  weight?: number;
  height?: number;
  age?: number;
  gender?: 'male' | 'female' | string; // doit exister
  diabetesType?: string;
  hba1c?: number;
  activityLevel?: string; // doit exister
  targetCalories?: number;
  targetCarbs?: number;
  targetProtein?: number;
  targetFat?: number;
  bmi?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NutritionAlert {
  id: number;
  userId: number;
  patientName?: string;
  alertType: 'HIGH_CARBS' | 'HIGH_GLUCOSE' | 'LOW_GLUCOSE' | 'IMBALANCED_MEAL' | 'MISSING_MEAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  recommendations: string;
  value: string;
  resolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  pendingAlerts: number;
  activePlans: number;
  weeklyGlucoseData: Array<{day: string, value: number}>;
}

export interface Message {
  id: number;
  senderId: number;
  senderName?: string;
  receiverId: number;
  receiverName?: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface PatientStats {
  patientId: number;
  totalCaloriesToday: number;
  totalCarbsToday: number;
  totalProteinToday: number;
  totalFatToday: number;
  glucoseLevels: GlucoseLevel[];
  recentMeals: FoodEntry[];
  complianceRate: number;
}

export interface GlucoseLevel {
  date: Date;
  value: number;
  mealTime?: string;
}
// ==================== CHAT ====================

export interface ChatMessage {
  id?: number;
  content: string;
  senderId: number;
  senderRole: 'patient' | 'nutritionist';
  receiverId: number;
  receiverRole: 'patient' | 'nutritionist';
  patientId: number;
  isRead?: boolean;
  createdAt?: string;
}