import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { NutritionService } from '../../../../services/nutrition.service';
import { FoodItem, FoodEntry, FoodAnalysisResult } from '../../../../models/diet-plan.model';
import { AuthService } from '../../../../core/services/auth.service';

interface ChatMessage {
  type: string;
  text?: string;
  result?: FoodAnalysisResult;
  timestamp: Date;
}

@Component({
  selector: 'app-food-chat',
  templateUrl: './food-chat.component.html',
  styleUrls: ['./food-chat.component.css']
})
export class FoodChatComponent implements OnInit {

  messages: ChatMessage[] = [];
  userInput = '';
  isLoading = false;
  history: FoodEntry[] = [];
  showHistory = false;
  patientId: number | null = null;
  patientName: string = '';

  // Pour l'image
  isAnalyzingImage = false;
  imagePreview: string | null = null;
  pendingImageAnalysis: boolean = false;
  pendingImageBase64: string | null = null;

  exampleTexts = [
    'I ate pizza and soda',
    'I had oatmeal with banana for breakfast',
    'I ate grilled chicken with rice and salad',
    'I had donuts and coffee this morning'
  ];

  constructor(
    private nutritionService: NutritionService,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // ✅ Récupérer l'ID du patient connecté depuis localStorage
      this.loadPatientInfo();
    }
    
    this.messages.push({
      type: 'ai',
      text: '👋 Bonjour ! Décrivez ce que vous avez mangé en anglais et je vais analyser les valeurs nutritionnelles pour vous.',
      timestamp: new Date()
    });
  }

 loadPatientInfo(): void {
  const user = this.authService.getCurrentUser();
  
  if (user) {
    this.patientId = user.id;
    this.patientName = `${user.firstName} ${user.lastName}`;
    console.log('✅ Patient connecté ID:', this.patientId);
    this.loadHistory();
  } else {
    console.error('❌ Aucun patient connecté');
    this.messages.push({
      type: 'ai',
      text: '❌ Erreur: Veuillez vous connecter pour utiliser cette fonctionnalité.',
      timestamp: new Date()
    });
    setTimeout(() => {
      this.router.navigate(['/auth/patient']);
    }, 3000);
  }
}

  // ==================== LOAD HISTORY ====================
  
  loadHistory(): void {
    if (!this.patientId) return;
    
    this.nutritionService.getFoodHistoryByPatient(this.patientId).subscribe({
      next: (entries) => {
        this.history = entries.map(e => ({
          ...e,
          parsedResult: this.nutritionService.parseAnalysisResult(e) || undefined
        }));
      },
      error: (err) => console.error('❌ Error loading history', err)
    });
  }

  // ==================== TEXT ANALYSIS ====================
  
  sendMessage(): void {
    if (!this.patientId) {
      alert('Veuillez vous connecter');
      return;
    }
    
    const text = this.userInput.trim();
    if (!text || this.isLoading) return;

    // Cas spécial: on attend une description après une image
    if (this.pendingImageAnalysis && this.pendingImageBase64) {
      this.handleImageDescription(text);
      return;
    }

    // Comportement normal (texte seul)
    this.processTextAnalysis(text);
  }

  private processTextAnalysis(text: string): void {
    if (!this.patientId) return;
    
    this.messages.push({ type: 'patient', text, timestamp: new Date() });
    this.userInput = '';
    this.isLoading = true;
    this.messages.push({ type: 'loading', timestamp: new Date() });

    this.nutritionService.analyzeFood(text, this.patientId).subscribe({
      next: (entry) => {
        this.messages = this.messages.filter(m => m.type !== 'loading');
        const result = this.nutritionService.parseAnalysisResult(entry);

        if (result && result.foods && result.foods.length > 0) {
          this.messages.push({ type: 'ai', result, timestamp: new Date() });
        } else {
          this.messages.push({
            type: 'ai',
            text: "❌ Je n'ai pas pu détecter d'aliments dans votre message. Essayez d'être plus précis, par exemple : \"I ate rice and grilled chicken\".",
            timestamp: new Date()
          });
        }

        this.isLoading = false;
        this.loadHistory();
        this.scrollToBottom();
      },
      error: (err) => {
        this.messages = this.messages.filter(m => m.type !== 'loading');
        this.messages.push({
          type: 'ai',
          text: '⚠️ Une erreur s\'est produite lors de l\'analyse. Vérifiez que le serveur ML est bien démarré.',
          timestamp: new Date()
        });
        this.isLoading = false;
        console.error('Food analysis error', err);
        this.scrollToBottom();
      }
    });
  }

  private handleImageDescription(text: string): void {
    if (!this.patientId) return;
    
    this.pendingImageAnalysis = false;
    
    this.messages.push({ type: 'patient', text, timestamp: new Date() });
    this.userInput = '';
    this.isLoading = true;
    this.messages.push({ type: 'loading', timestamp: new Date() });

    this.nutritionService.analyzeFood(text, this.patientId).subscribe({
      next: (entry) => {
        this.messages = this.messages.filter(m => m.type !== 'loading');
        const result = this.nutritionService.parseAnalysisResult(entry);

        if (result && result.foods && result.foods.length > 0) {
          this.messages.push({ type: 'ai', result, timestamp: new Date() });
        } else {
          this.messages.push({
            type: 'ai',
            text: "❌ Je n'ai pas pu analyser votre description. Essayez d'être plus précis.",
            timestamp: new Date()
          });
        }

        this.isLoading = false;
        this.imagePreview = null;
        this.pendingImageBase64 = null;
        this.loadHistory();
        this.scrollToBottom();
      },
      error: (err) => {
        this.messages = this.messages.filter(m => m.type !== 'loading');
        this.messages.push({
          type: 'ai',
          text: '⚠️ Erreur lors de l\'analyse. Veuillez réessayer.',
          timestamp: new Date()
        });
        this.isLoading = false;
        this.pendingImageBase64 = null;
        console.error('Error:', err);
        this.scrollToBottom();
      }
    });
  }

  // ==================== IMAGE ANALYSIS ====================
  
  onImageUpload(event: Event): void {
    if (!this.patientId) {
      alert('Veuillez vous connecter');
      return;
    }
    
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.messages.push({
        type: 'ai',
        text: '❌ Veuillez sélectionner une image valide.',
        timestamp: new Date()
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.imagePreview = base64;
      this.analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  }

  analyzeImage(base64Image: string): void {
    if (!this.patientId) return;
    
    this.isAnalyzingImage = true;
    this.pendingImageAnalysis = true;
    this.pendingImageBase64 = base64Image;

    // Afficher message patient avec image
    this.messages.push({
      type: 'patient',
      text: '📸 Photo de repas envoyée',
      timestamp: new Date()
    });

    // Loading bubble
    this.messages.push({ type: 'loading', timestamp: new Date() });

    this.nutritionService.analyzeFoodImage(base64Image, this.patientId).subscribe({
      next: (response: any) => {
        this.messages = this.messages.filter(m => m.type !== 'loading');

        if (response.need_manual_input) {
          // Message demandant la description
          this.messages.push({
            type: 'ai',
            text: response.message || '📷 Photo reçue ! Pouvez-vous me décrire ce que vous avez mangé ? (ex: "pizza and salad")',
            timestamp: new Date()
          });
          this.isAnalyzingImage = false;
          this.scrollToBottom();
        } else if (response.detected_foods && response.detected_foods.length > 0) {
          // Aliments détectés automatiquement
          this.handleDetectedFoods(response.detected_foods);
        } else {
          this.messages.push({
            type: 'ai',
            text: "❌ Je n'ai pas pu identifier les aliments sur cette photo. Pouvez-vous me décrire ce que vous avez mangé ?",
            timestamp: new Date()
          });
          this.isAnalyzingImage = false;
          this.imagePreview = null;
          this.pendingImageAnalysis = false;
          this.scrollToBottom();
        }
      },
      error: (error) => {
        this.messages = this.messages.filter(m => m.type !== 'loading');
        console.error('Image analysis error:', error);
        
        this.messages.push({
          type: 'ai',
          text: '⚠️ Erreur lors de l\'analyse de l\'image. Pouvez-vous me décrire ce que vous avez mangé ?',
          timestamp: new Date()
        });
        this.isAnalyzingImage = false;
        this.imagePreview = null;
        this.pendingImageAnalysis = false;
        this.scrollToBottom();
      }
    });
  }

  private handleDetectedFoods(foods: string[]): void {
    if (!this.patientId) return;
    
    this.messages.push({
      type: 'ai',
      text: `🔍 Aliments détectés : ${foods.map(f => `**${f}**`).join(', ')}. Analyse nutritionnelle en cours...`,
      timestamp: new Date()
    });

    this.messages.push({ type: 'loading', timestamp: new Date() });
    
    const foodText = `I ate ${foods.join(' and ')}`;
    
    this.nutritionService.analyzeFood(foodText, this.patientId).subscribe({
      next: (entry) => {
        this.messages = this.messages.filter(m => m.type !== 'loading');
        const result = this.nutritionService.parseAnalysisResult(entry);

        if (result && result.foods && result.foods.length > 0) {
          this.messages.push({ type: 'ai', result, timestamp: new Date() });
        } else {
          this.messages.push({
            type: 'ai',
            text: `✅ Repas enregistré : ${foods.join(', ')}.`,
            timestamp: new Date()
          });
        }

        this.isAnalyzingImage = false;
        this.imagePreview = null;
        this.pendingImageAnalysis = false;
        this.loadHistory();
        this.scrollToBottom();
      },
      error: () => {
        this.messages = this.messages.filter(m => m.type !== 'loading');
        this.messages.push({
          type: 'ai',
          text: `✅ Aliments détectés : ${foods.join(', ')}. Données nutritionnelles en cours de calcul.`,
          timestamp: new Date()
        });
        this.isAnalyzingImage = false;
        this.imagePreview = null;
        this.pendingImageAnalysis = false;
        this.scrollToBottom();
      }
    });
  }

  cancelImageAnalysis(): void {
    this.pendingImageAnalysis = false;
    this.pendingImageBase64 = null;
    this.imagePreview = null;
    this.isAnalyzingImage = false;
    this.messages.push({
      type: 'ai',
      text: '❌ Analyse d\'image annulée.',
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  // ==================== HELPERS ====================
  
  useExample(text: string): void {
    this.userInput = text;
  }

  getTotals(foods: FoodItem[]) {
    return this.nutritionService.getTotals(foods);
  }

  getMacroPercent(value: number, total: number): number {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }

  getCalorieColor(calories: number): string {
    if (calories < 200) return '#10b981';
    if (calories < 500) return '#f59e0b';
    return '#ef4444';
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
  }

  deleteEntry(id: number): void {
    if (!confirm('Supprimer cet élément ?')) return;

    this.nutritionService.deleteFoodEntry(id).subscribe({
      next: () => {
        this.history = this.history.filter(e => e.id !== id);
      },
      error: (err) => {
        console.error('Erreur suppression', err);
      }
    });
  }

  private scrollToBottom(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const container = document.getElementById('chat-messages');
        if (container) container.scrollTop = container.scrollHeight;
      }, 100);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  clearImagePreview(): void {
    this.imagePreview = null;
    this.pendingImageAnalysis = false;
    this.pendingImageBase64 = null;
  }
}