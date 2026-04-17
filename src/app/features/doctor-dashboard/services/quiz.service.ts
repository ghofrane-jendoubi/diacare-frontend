// src/app/features/patient-education/services/quiz.service.ts
import { Injectable } from '@angular/core';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  /**
   * Génère un quiz à partir du contenu HTML de l'article.
   * Retourne une liste de questions (max 5).
   */
  generateQuiz(content: string): QuizQuestion[] {
    // Nettoyer le HTML et récupérer le texte brut
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    if (plainText.length < 100) {
      return [];
    }

    // 1. Extraire les phrases importantes (résumé extractif)
    const importantSentences = this.extractImportantSentences(plainText, 6);

    // 2. Pour chaque phrase importante, créer une question
    const questions: QuizQuestion[] = [];
    for (const sentence of importantSentences) {
      const q = this.createQuestionFromSentence(sentence);
      if (q) {
        questions.push(q);
        if (questions.length >= 5) break;
      }
    }

    // 3. Si pas assez de questions, on complète avec des phrases aléatoires
    if (questions.length < 3) {
      const allSentences = this.splitIntoSentences(plainText);
      for (const sentence of allSentences) {
        if (questions.length >= 3) break;
        const q = this.createQuestionFromSentence(sentence);
        if (q && !questions.some(existing => existing.question === q.question)) {
          questions.push(q);
        }
      }
    }

    return questions;
  }

  // Extrait les N phrases les plus importantes (algorithme extractif)
  private extractImportantSentences(text: string, count: number): string[] {
    const sentences = this.splitIntoSentences(text);
    if (sentences.length <= count) return sentences;

    const wordFreq = this.computeWordFrequencies(text);
    const scored = sentences.map(s => ({
      text: s,
      score: this.scoreSentence(s, wordFreq)
    }));
    const top = this.selectTopSentences(scored, count);
    return top.map(t => t.text);
  }

  // Crée une question QCM à partir d'une phrase
  private createQuestionFromSentence(sentence: string): QuizQuestion | null {
    // Extraire les mots clés de la phrase (mots significatifs)
    const keywords = this.extractKeywords(sentence);
    if (keywords.length === 0) return null;

    // Construire une question
    const question = this.buildQuestion(sentence, keywords);

    // Générer des options : la bonne réponse + 3 distracteurs
    const correctAnswer = this.extractAnswer(sentence, keywords);
    const options = this.generateOptions(correctAnswer, keywords);

    // Explication : la phrase originale reformulée
    const explanation = `Selon l'article : "${sentence}"`;

    return {
      question,
      options,
      correctAnswer,
      explanation
    };
  }

  // Construit une question en masquant le mot-clé principal
  private buildQuestion(sentence: string, keywords: string[]): string {
    // Choisir le mot-clé le plus long (le plus spécifique)
    const mainKeyword = keywords.sort((a,b) => b.length - a.length)[0];
    // Remplacer le mot-clé par "______" dans la phrase
    const regex = new RegExp(`\\b${this.escapeRegex(mainKeyword)}\\b`, 'gi');
    const questionText = sentence.replace(regex, '______');
    // Nettoyer et capitaliser
    return questionText.trim() + ' ?';
  }

  // Extrait la bonne réponse (le mot-clé)
  private extractAnswer(sentence: string, keywords: string[]): string {
    return keywords.sort((a,b) => b.length - a.length)[0];
  }

  // Génère 3 distracteurs plausibles
  private generateOptions(correctAnswer: string, allKeywords: string[]): string[] {
    const options = [correctAnswer];
    // Prendre d'autres mots-clés (sans répéter)
    const others = allKeywords.filter(k => k !== correctAnswer);
    for (let i = 0; i < 3 && i < others.length; i++) {
      options.push(others[i]);
    }
    // Si pas assez, ajouter des termes génériques
    const fallbacks = ['diabète', 'insuline', 'glycémie', 'alimentation', 'activité physique', 'traitement'];
    while (options.length < 4) {
      const candidate = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      if (!options.includes(candidate)) options.push(candidate);
    }
    // Mélanger les options
    return this.shuffleArray(options);
  }

  // Extrait les mots significatifs d'une phrase (stop words exclus)
  private extractKeywords(sentence: string): string[] {
    const words = sentence.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .match(/\b[a-z0-9]{4,}\b/g) || [];
    const stopWords = new Set([
      'le', 'la', 'les', 'de', 'des', 'du', 'un', 'une', 'et', 'ou', 'mais', 'donc', 'car', 'ni',
      'ce', 'cette', 'ces', 'cet', 'il', 'elle', 'ils', 'elles', 'on', 'nous', 'vous', 'je', 'tu',
      'me', 'te', 'se', 'lui', 'leur', 'y', 'en', 'a', 'dans', 'par', 'pour', 'sur', 'sous', 'avec',
      'sans', 'contre', 'vers', 'chez', 'entre', 'pendant', 'depuis', 'avant', 'après', 'dès',
      'jusque', 'hormis', 'sauf', 'selon', 'dont', 'où', 'quand', 'comment', 'pourquoi', 'que',
      'qui', 'quoi', 'quel', 'quelle', 'quels', 'quelles', 'est', 'sont', 'être', 'avoir', 'faire'
    ]);
    return words.filter(w => !stopWords.has(w));
  }

  // ========== Utilitaires ==========
  private splitIntoSentences(text: string): string[] {
    return text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  }

  private computeWordFrequencies(text: string): Map<string, number> {
    const stopWords = new Set([
      'le', 'la', 'les', 'de', 'des', 'du', 'un', 'une', 'et', 'ou', 'mais', 'donc', 'car', 'ni',
      'ce', 'cette', 'ces', 'cet', 'il', 'elle', 'ils', 'elles', 'on', 'nous', 'vous', 'je', 'tu',
      'me', 'te', 'se', 'lui', 'leur', 'y', 'en', 'a', 'dans', 'par', 'pour', 'sur', 'sous', 'avec',
      'sans', 'contre', 'vers', 'chez', 'entre', 'pendant', 'depuis', 'avant', 'après', 'dès',
      'jusque', 'hormis', 'sauf', 'selon', 'dont', 'où', 'quand', 'comment', 'pourquoi', 'que',
      'qui', 'quoi', 'quel', 'quelle', 'quels', 'quelles', 'est', 'sont', 'être', 'avoir', 'faire'
    ]);
    const words = text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .match(/\b[a-z0-9]{3,}\b/g) || [];
    const freq = new Map<string, number>();
    for (const w of words) {
      if (!stopWords.has(w)) {
        freq.set(w, (freq.get(w) || 0) + 1);
      }
    }
    return freq;
  }

  private scoreSentence(sentence: string, wordFreq: Map<string, number>): number {
    const words = sentence.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .match(/\b[a-z0-9]{3,}\b/g) || [];
    let score = 0;
    for (const w of words) {
      score += wordFreq.get(w) || 0;
    }
    return score / (words.length || 1);
  }

  private selectTopSentences(scored: Array<{ text: string, score: number }>, n: number): Array<{ text: string, score: number }> {
    const sorted = [...scored].sort((a, b) => b.score - a.score);
    const top = sorted.slice(0, n);
    const indices = new Map<string, number>();
    scored.forEach((s, idx) => indices.set(s.text, idx));
    top.sort((a, b) => (indices.get(a.text) || 0) - (indices.get(b.text) || 0));
    return top;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private shuffleArray<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}