import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PredictionService, PredictionResult } from '../../../../services/prediction.service';

@Component({
  selector: 'app-diabetes-prediction',
  templateUrl: './diabetes-prediction.component.html',
  styleUrls: ['./diabetes-prediction.component.css']
})
export class DiabetesPredictionComponent implements OnInit {
  predictionForm: FormGroup;
  result: PredictionResult | null = null;
  isLoading = false;
  showResult = false;

  infos = [
    { title: 'Analyse précise', description: 'Modèle IA entraîné sur des milliers de données médicales', icon: 'bi bi-cpu', bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: '100% gratuit', description: 'Outil de prévention accessible à toutes les femmes', icon: 'bi bi-gift', bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { title: 'Recommandations', description: 'Conseils personnalisés basés sur vos résultats', icon: 'bi bi-lightbulb', bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
  ];

  understandItems = [
    { icon: 'bi bi-1-circle', title: 'Remplissez le formulaire', description: 'Indiquez vos valeurs médicales récentes' },
    { icon: 'bi bi-2-circle', title: 'Analyse IA', description: 'Notre modèle analyse vos données instantanément' },
    { icon: 'bi bi-3-circle', title: 'Résultat personnalisé', description: 'Recevez votre évaluation et des conseils adaptés' }
  ];

  fields = [
    { name: 'Pregnancies', label: 'Grossesses', type: 'number', min: 0, max: 20, icon: 'bi bi-baby', unit: '' },
    { name: 'Glucose', label: 'Glucose', type: 'number', min: 44, max: 200, icon: 'bi bi-droplet', unit: 'mg/dL' },
    { name: 'BloodPressure', label: 'Pression artérielle', type: 'number', min: 24, max: 122, icon: 'bi bi-heart-pulse', unit: 'mm Hg' },
    { name: 'SkinThickness', label: 'Épaisseur cutanée', type: 'number', min: 0, max: 110, icon: 'bi bi-rulers', unit: 'mm' },
    { name: 'Insulin', label: 'Insuline', type: 'number', min: 0, max: 850, icon: 'bi bi-droplet-half', unit: 'µU/mL' },
    { name: 'BMI', label: 'IMC', type: 'number', min: 10, max: 70, icon: 'bi bi-person-standing', unit: 'kg/m²' },
    { name: 'DiabetesPedigreeFunction', label: 'Antécédents familiaux', type: 'number', min: 0, max: 2.5, icon: 'bi bi-tree', unit: '' },
    { name: 'Age', label: 'Âge', type: 'number', min: 18, max: 90, icon: 'bi bi-calendar', unit: 'ans' }
  ];

  constructor(
    private fb: FormBuilder,
    private predictionService: PredictionService,
    private router: Router
  ) {
    this.predictionForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.fields.forEach(field => {
      this.predictionForm.addControl(field.name, this.fb.control('', [
        Validators.required,
        Validators.min(field.min),
        Validators.max(field.max)
      ]));
    });
  }

  getFieldDescription(fieldName: string): string {
    const descriptions: { [key: string]: string } = {
      'Pregnancies': 'Nombre de grossesses antérieures',
      'Glucose': 'Taux de glucose plasmatique à jeun',
      'BloodPressure': 'Pression artérielle diastolique',
      'SkinThickness': 'Épaisseur du pli cutané tricipital',
      'Insulin': 'Niveau d\'insuline à jeun',
      'BMI': 'Indice de Masse Corporelle',
      'DiabetesPedigreeFunction': 'Score d\'antécédents familiaux',
      'Age': 'Âge en années'
    };
    return descriptions[fieldName] || '';
  }

  getFieldExample(fieldName: string): string {
    const examples: { [key: string]: string } = {
      'Pregnancies': 'Ex: 2',
      'Glucose': 'Ex: 120',
      'BloodPressure': 'Ex: 70',
      'SkinThickness': 'Ex: 25',
      'Insulin': 'Ex: 80',
      'BMI': 'Ex: 25.5',
      'DiabetesPedigreeFunction': 'Ex: 0.45',
      'Age': 'Ex: 35'
    };
    return examples[fieldName] || '';
  }

  getFieldHint(fieldName: string): string {
    const hints: { [key: string]: string } = {
      'Glucose': 'Normale : 70-100 mg/dL',
      'BloodPressure': 'Normale : < 120/80 mm Hg',
      'BMI': 'Normal : 18.5-25 | Surpoids : 25-30 | Obésité : > 30'
    };
    return hints[fieldName] || '';
  }

  getRecommendations(result: PredictionResult | null): string[] {
    const recommendations: string[] = [];
    if (!result || !result.result) {
      return recommendations;
    }
    
    if (result.result.prediction === 1) {
      recommendations.push("Consultez un médecin endocrinologue rapidement");
      recommendations.push("Surveillez votre glycémie régulièrement");
      recommendations.push("Adoptez une alimentation pauvre en sucres");
      recommendations.push("Pratiquez une activité physique régulière");
    } else {
      recommendations.push("Maintenez une alimentation équilibrée");
      recommendations.push("Faites vérifier votre glycémie une fois par an");
      recommendations.push("Pratiquez une activité physique régulière");
    }
    return recommendations;
  }

  onSubmit(): void {
    if (this.predictionForm.invalid) {
      Object.keys(this.predictionForm.controls).forEach(key => {
        this.predictionForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.showResult = false;
    
    this.predictionService.predictDiabetes(this.predictionForm.value).subscribe({
      next: (response) => {
        this.result = response;
        this.showResult = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        // ✅ Correction : créer un objet result valide même en cas d'erreur
        this.result = {
          success: false,
          result: {
            prediction: 0,
            label: 'Erreur',
            probability: 0,
            probability_pct: 0,
            risk_level: 'inconnu',
            color: 'gray',
            message: 'Une erreur est survenue',
            threshold_used: 0.4,
            disclaimer: 'Veuillez réessayer'
          },
          error: 'Erreur lors de l\'analyse'
        };
        this.showResult = true;
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    this.predictionForm.reset();
    this.result = null;
    this.showResult = false;
  }

  resetAndRetry(): void {
    this.resetForm();
  }

  closeModal(): void {
    this.showResult = false;
  }

  openAppointment(): void {
    this.showResult = false;
    this.router.navigate(['/patient/doctors']);
  }

  openConsultation(): void {
    this.showResult = false;
    this.router.navigate(['/patient/chat']);
  }
  // Ajoutez ces propriétés dans la classe
showFieldInfo = false;
selectedField: any = null;

// Ajoutez ces méthodes
openFieldInfo(field: any): void {
  this.selectedField = field;
  this.showFieldInfo = true;
}

closeFieldInfo(): void {
  this.showFieldInfo = false;
  this.selectedField = null;
}

getFieldExplanation(fieldName: string): string {
  const explanations: { [key: string]: string } = {
    'Pregnancies': 'Le nombre de grossesses antérieures est un facteur de risque, surtout au-delà de 5 grossesses.',
    'Glucose': 'Le glucose est votre taux de sucre dans le sang à jeun. Plus il est élevé, plus le risque de diabète est important.',
    'BloodPressure': 'La pression artérielle élevée est souvent associée au diabète et aux complications cardiovasculaires.',
    'SkinThickness': 'L\'épaisseur du pli cutané reflète la graisse sous-cutanée. Un excès indique une obésité, facteur de risque majeur.',
    'Insulin': 'L\'insuline est l\'hormone qui régule la glycémie. Un taux élevé indique une résistance à l\'insuline.',
    'BMI': 'L\'IMC mesure votre corpulence. Plus il est élevé, plus le risque de diabète de type 2 est important.',
    'DiabetesPedigreeFunction': 'Ce score mesure vos antécédents familiaux de diabète. Plus il est élevé, plus le risque génétique est fort.',
    'Age': 'Le risque de diabète augmente significativement avec l\'âge, surtout après 45 ans.'
  };
  return explanations[fieldName] || '';
}

getFieldImpact(fieldName: string): string {
  const impacts: { [key: string]: string } = {
    'Pregnancies': '📈 Augmentation du risque : +7% par grossesse après 5 grossesses. Les femmes ayant eu un diabète gestationnel ont un risque 7 à 8 fois plus élevé.',
    'Glucose': '📈 À jeun : < 100 mg/dL = normal | 100-125 = prédiabète | > 126 = diabète. Chaque augmentation de 10 mg/dL augmente le risque de 15%.',
    'BloodPressure': '📈 L\'hypertension (≥ 130/80) double le risque de diabète et augmente les complications cardiovasculaires.',
    'SkinThickness': '📈 Une épaisseur > 35 mm indique une obésité abdominale, facteur de risque majeur multipliant le risque par 3.',
    'Insulin': '📈 Un taux > 25 µU/mL indique une résistance à l\'insuline, précurseur du diabète de type 2.',
    'BMI': '📈 Surpoids (25-30) : risque x2 | Obésité (30-35) : risque x3 | Obésité sévère (>35) : risque x5.',
    'DiabetesPedigreeFunction': '📈 Score > 0.5 = risque modéré | > 0.8 = risque élevé | > 1.2 = risque très élevé.',
    'Age': '📈 Risque double tous les 10 ans après 45 ans. À 65 ans, le risque est 5 fois plus élevé qu\'à 35 ans.'
  };
  return impacts[fieldName] || '';
}

getFieldNormalRange(fieldName: string): string {
  const ranges: { [key: string]: string } = {
    'Pregnancies': '0 - 5 grossesses',
    'Glucose': '70 - 100 mg/dL (à jeun)',
    'BloodPressure': '< 120/80 mm Hg',
    'SkinThickness': '15 - 25 mm',
    'Insulin': '2 - 25 µU/mL',
    'BMI': '18.5 - 25 kg/m²',
    'DiabetesPedigreeFunction': '0.1 - 0.5',
    'Age': '20 - 45 ans'
  };
  return ranges[fieldName] || '';
}

getFieldRiskRange(fieldName: string): string {
  const risks: { [key: string]: string } = {
    'Pregnancies': '⚠️ 6+ grossesses : risque significatif',
    'Glucose': '⚠️ 100-125 = prédiabète | > 126 = diabète suspecté',
    'BloodPressure': '⚠️ 120-129/80-84 = préhypertension | > 130/85 = hypertension',
    'SkinThickness': '⚠️ > 30 mm : surpoids | > 35 mm : obésité',
    'Insulin': '⚠️ > 25 µU/mL : résistance à l\'insuline',
    'BMI': '⚠️ 25-30 = surpoids | 30-35 = obésité | > 35 = obésité sévère',
    'DiabetesPedigreeFunction': '⚠️ > 0.8 : risque génétique élevé',
    'Age': '⚠️ > 45 ans : risque augmenté | > 60 ans : risque élevé'
  };
  return risks[fieldName] || '';
}
}