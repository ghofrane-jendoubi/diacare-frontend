import { Component, OnInit } from '@angular/core';
import { NutritionService, FoodEntry, FoodAnalysisResult, FoodItem } from '../../../../services/nutrition.service';
interface ChatMessage {
  type: 'patient' | 'ai' | 'loading';
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
  patientId: number = 1; // Remplacer par user.id quand AuthService sera prêt

  exampleTexts = [
    'I ate pizza and soda',
    'I had oatmeal with banana for breakfast',
    'I ate grilled chicken with rice and salad',
    'I had donuts and coffee this morning'
  ];

  constructor(
    private nutritionService: NutritionService
  ) {}

  ngOnInit(): void {
    // TODO: quand ton collègue finit AuthService, remplacer par :
    // const user = JSON.parse(localStorage.getItem('user') || '{}');
    // this.patientId = user.id;

    this.messages.push({
      type: 'ai',
      text: '👋 Bonjour ! Décrivez ce que vous avez mangé en anglais et je vais analyser les valeurs nutritionnelles pour vous.',
      timestamp: new Date()
    });

    this.loadHistory();
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
    setTimeout(() => {
      const container = document.getElementById('chat-messages');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  }

  trackByIndex(index: number): number {
    return index;
  }
}