import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NutritionService } from '../../../../services/nutrition.service';
import { FoodItem, FoodEntry, FoodAnalysisResult } from '../../../../models/diet-plan.model';

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
  patientId: number = 1;

  exampleTexts = [
    'I ate pizza and soda',
    'I had oatmeal with banana for breakfast',
    'I ate grilled chicken with rice and salad',
    'I had donuts and coffee this morning'
  ];

  constructor(
    private nutritionService: NutritionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.messages.push({
      type: 'ai',
      text: '👋 Bonjour ! Décrivez ce que vous avez mangé en anglais et je vais analyser les valeurs nutritionnelles pour vous.',
      timestamp: new Date()
    });

    if (isPlatformBrowser(this.platformId)) {
      this.loadHistory();
    }
  }

  loadHistory(): void {
    this.nutritionService.getFoodHistory().subscribe({
      next: (entries) => {
        this.history = entries.map(e => ({
          ...e,
          parsedResult: this.nutritionService.parseAnalysisResult(e) || undefined
        }));
      },
      error: (err) => console.error('Error loading history', err)
    });
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.isLoading) return;

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
        if (isPlatformBrowser(this.platformId)) {
          this.loadHistory();
          this.scrollToBottom();
        }
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
      }
    });
  }

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
  isAnalyzingImage = false;
imagePreview: string | null = null;

onImageUpload(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Vérifier que c'est bien une image
  if (!file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = () => {
    const base64 = (reader.result as string).split(',')[1];
    this.imagePreview = reader.result as string;
    this.analyzeImageWithClarifai(base64);
  };
  reader.readAsDataURL(file);
}

analyzeImageWithClarifai(base64: string): void {
  this.isAnalyzingImage = true;

  // Afficher message patient avec image
  this.messages.push({
    type: 'patient',
    text: '📸 Photo de repas envoyée',
    timestamp: new Date()
  });

  // Loading bubble
  this.messages.push({ type: 'loading', timestamp: new Date() });

 this.nutritionService.analyzeFoodImage(base64, this.patientId).subscribe({
    next: (clarifaiResponse) => {
      const foods = this.nutritionService.extractFoodsFromClarifai(clarifaiResponse);

      if (foods.length === 0) {
        this.messages = this.messages.filter(m => m.type !== 'loading');
        this.messages.push({
          type: 'ai',
          text: "❌ Impossible de détecter des aliments dans cette photo. Essayez une photo plus claire.",
          timestamp: new Date()
        });
        this.isAnalyzingImage = false;
        return;
      }

      // Construire le texte pour Flask ML
      const foodText = `I ate ${foods.join(' and ')}`;

      // Message IA avec les aliments détectés
      this.messages = this.messages.filter(m => m.type !== 'loading');
      this.messages.push({
        type: 'ai',
        text: `🔍 Clarifai a détecté : ${foods.map(f => `**${f}**`).join(', ')}. Analyse nutritionnelle en cours...`,
        timestamp: new Date()
      });

      // Loading pour ML
      this.messages.push({ type: 'loading', timestamp: new Date() });

      // Envoyer au ML Flask via Spring
      this.nutritionService.analyzeFood(foodText, this.patientId).subscribe({
        next: (entry) => {
          this.messages = this.messages.filter(m => m.type !== 'loading');
          const result = this.nutritionService.parseAnalysisResult(entry);

          if (result && result.foods && result.foods.length > 0) {
            this.messages.push({ type: 'ai', result, timestamp: new Date() });
          } else {
            this.messages.push({
              type: 'ai',
              text: `✅ Aliments détectés : ${foods.join(', ')}. Données nutritionnelles non disponibles pour ces aliments.`,
              timestamp: new Date()
            });
          }

          this.isAnalyzingImage = false;
          this.imagePreview = null;
          if (isPlatformBrowser(this.platformId)) {
            this.loadHistory();
            this.scrollToBottom();
          }
        },
        error: () => {
          this.messages = this.messages.filter(m => m.type !== 'loading');
          this.messages.push({
            type: 'ai',
            text: '⚠️ Erreur lors de l\'analyse nutritionnelle.',
            timestamp: new Date()
          });
          this.isAnalyzingImage = false;
        }
      });
    },
    error: () => {
      this.messages = this.messages.filter(m => m.type !== 'loading');
      this.messages.push({
        type: 'ai',
        text: '⚠️ Erreur Clarifai. Vérifiez votre clé API ou utilisez le texte.',
        timestamp: new Date()
      });
      this.isAnalyzingImage = false;
    }
  });
}
}