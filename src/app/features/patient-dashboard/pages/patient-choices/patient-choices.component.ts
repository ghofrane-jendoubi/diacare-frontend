import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-choices',
  templateUrl: './patient-choices.component.html',
  styleUrls: ['./patient-choices.component.css']
})
export class PatientChoicesComponent {
  activeFaq: number | null = null;

  faqs = [
    {
      question: "Quelle est la différence entre les deux modèles de prédiction ?",
      answer: "Le modèle IA Standard analyse 16 symptômes et convient à tous les patients. Le modèle spécifique femmes est basé sur le dataset Pima et utilise 8 indicateurs médicaux (glycémie, IMC, âge, etc.). Il est spécialement calibré pour les femmes."
    },
    {
      question: "Les résultats sont-ils fiables ?",
      answer: "Nos modèles atteignent une précision de 96-98%. Cependant, ces résultats sont indicatifs et ne remplacent pas un avis médical professionnel. Nous recommandons toujours une consultation avec un médecin pour confirmation."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Absolument ! Toutes vos données sont cryptées et traitées conformément au RGPD. Nous ne partageons jamais vos informations personnelles avec des tiers."
    },
    {
      question: "Puis-je consulter un médecin directement depuis la plateforme ?",
      answer: "Oui ! Vous pouvez prendre rendez-vous avec nos médecins spécialistes directement depuis l'annuaire. Les consultations peuvent se faire en ligne ou en présentiel."
    },
    {
      question: "L'évaluation est-elle vraiment gratuite ?",
      answer: "Oui, l'évaluation du risque de diabète est entièrement gratuite pour tous nos utilisateurs."
    }
  ];

  constructor(private router: Router) {}

  navigateTo(path: string): void {
    this.router.navigate([`/patient/${path}`]);
  }

  toggleFaq(index: number): void {
    this.activeFaq = this.activeFaq === index ? null : index;
  }
}