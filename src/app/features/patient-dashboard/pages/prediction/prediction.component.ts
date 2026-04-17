import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DiabetePredictionService, DiabetesPredictionResponse } from '../../../../services/diabete-prediction.service';

@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.css']
})
export class PredictionComponent implements OnInit {
  predictionForm: FormGroup;
  result: DiabetesPredictionResponse | null = null;
  isLoading = false;
  showResult = false;

  // Modal state
  showModal = false;
  modalTitle = '';
  modalIcon = '';
  modalDescription = '';
  modalNormal = '';
  modalRisk = '';
  modalTip = '';

  symptoms = [
    { name: 'Polyuria', label: 'Polyurie (besoin fréquent d\'uriner)', description: 'Vous avez besoin d\'uriner plusieurs fois par jour, même la nuit. C\'est un signe classique du diabète car le corps essaie d\'éliminer l\'excès de sucre.' },
    { name: 'Polydipsia', label: 'Polydipsie (soif excessive)', description: 'Vous avez constamment soif, même après avoir bu. Le corps tente de compenser la perte d\'eau due aux urines fréquentes.' },
    { name: 'sudden_weight_loss', label: 'Perte de poids soudaine', description: 'Vous perdez du poids sans faire de régime. Le corps, ne pouvant pas utiliser le sucre, commence à brûler les graisses et les muscles.' },
    { name: 'weakness', label: 'Faiblesse générale', description: 'Vous vous sentez fatigué(e) sans raison. Le manque d\'énergie vient de l\'incapacité des cellules à utiliser le sucre correctement.' },
    { name: 'Polyphagia', label: 'Polyphagie (faim excessive)', description: 'Vous avez faim tout le temps. Le corps réclame de l\'énergie qu\'il n\'arrive pas à utiliser.' },
    { name: 'Genital_thrush', label: 'Mycoses génitales', description: 'Infections à levures récurrentes. Le sucre en excès favorise le développement des champignons.' },
    { name: 'visual_blurring', label: 'Vision floue', description: 'Votre vision devient floue par moments. L\'excès de sucre affecte les petits vaisseaux sanguins des yeux.' },
    { name: 'Itching', label: 'Démangeaisons', description: 'Peau qui gratte, surtout au niveau des jambes et des pieds. La peau sèche et les infections cutanées sont fréquentes.' },
    { name: 'Irritability', label: 'Irritabilité', description: 'Changements d\'humeur fréquents. Les variations de glycémie affectent le système nerveux.' },
    { name: 'delayed_healing', label: 'Cicatrisation lente', description: 'Les blessures mettent du temps à guérir. Le sucre affaiblit le système immunitaire et la circulation.' },
    { name: 'partial_paresis', label: 'Parésie partielle', description: 'Faiblesse musculaire localisée. Les nerfs peuvent être affectés par le diabète à long terme.' },
    { name: 'muscle_stiffness', label: 'Raideur musculaire', description: 'Sensation de muscles rigides. Peut être lié à une mauvaise circulation ou à des problèmes nerveux.' },
    { name: 'Alopecia', label: 'Chute de cheveux', description: 'Perte de cheveux excessive. Le stress oxydatif lié au diabète peut affecter la santé capillaire.' }
  ];

  riskFactors = [
    { name: 'Obesity', label: 'Obésité', description: 'IMC supérieur à 30. L\'excès de graisse, surtout au niveau du ventre, augmente la résistance à l\'insuline. C\'est l\'un des facteurs de risque les plus importants.', normal: 'IMC entre 18.5 et 25', risk: 'IMC > 30', tip: 'Perdre 5-10% de votre poids réduit significativement le risque' }
  ];

  constructor(
    private fb: FormBuilder,
    private predictionService: DiabetePredictionService,
    private router: Router
  ) {
    this.predictionForm = this.fb.group({
      Age: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
      Gender: ['', Validators.required],
      Polyuria: [0],
      Polydipsia: [0],
      sudden_weight_loss: [0],
      weakness: [0],
      Polyphagia: [0],
      Genital_thrush: [0],
      visual_blurring: [0],
      Itching: [0],
      Irritability: [0],
      delayed_healing: [0],
      partial_paresis: [0],
      muscle_stiffness: [0],
      Alopecia: [0],
      Obesity: [0]
    });
  }

  ngOnInit(): void { }

  openInfoModal(type: string): void {
    if (type === 'age') {
      this.modalTitle = 'Âge';
      this.modalIcon = 'bi bi-calendar';
      this.modalDescription = 'L\'âge est un facteur de risque important. Plus vous êtes âgé, plus le risque de développer un diabète de type 2 augmente.';
      this.modalNormal = 'Moins de 45 ans';
      this.modalRisk = 'Plus de 45 ans (risque double)';
      this.modalTip = 'Après 45 ans, il est recommandé de faire vérifier sa glycémie tous les 3 ans.';
    } else if (type === 'gender') {
      this.modalTitle = 'Genre';
      this.modalIcon = 'bi bi-gender-ambiguous';
      this.modalDescription = 'Les hommes ont un risque légèrement plus élevé de développer un diabète de type 2 que les femmes, surtout avant 50 ans. Après la ménopause, le risque chez les femmes rejoint celui des hommes.';
      this.modalNormal = 'Facteur à prendre en compte';
      this.modalRisk = 'Hommes (risque légèrement plus élevé)';
      this.modalTip = 'Quel que soit votre genre, une alimentation saine et une activité physique régulière sont essentielles.';
    }
    this.showModal = true;
  }

  openSymptomModal(symptom: any): void {
    this.modalTitle = symptom.label;
    this.modalIcon = 'bi bi-activity';
    this.modalDescription = symptom.description;
    this.modalNormal = 'Absence de ce symptôme';
    this.modalRisk = 'Présence de ce symptôme (facteur de risque)';
    this.modalTip = 'Si vous présentez ce symptôme, parlez-en à votre médecin.';
    this.showModal = true;
  }

  openRiskModal(factor: any): void {
    this.modalTitle = factor.label;
    this.modalIcon = 'bi bi-exclamation-triangle';
    this.modalDescription = factor.description;
    this.modalNormal = factor.normal || 'Poids santé (IMC 18.5-25)';
    this.modalRisk = factor.risk || 'Obésité (IMC > 30)';
    this.modalTip = factor.tip || 'Une perte de poids de 5-10% peut réduire significativement le risque.';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  closeResultModal(): void {
    this.showResult = false;
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

    const formValue = this.predictionForm.value;
    const payload = {
      Age: Number(formValue.Age),
      Gender: Number(formValue.Gender),
      Polyuria: formValue.Polyuria ? 1 : 0,
      Polydipsia: formValue.Polydipsia ? 1 : 0,
      sudden_weight_loss: formValue.sudden_weight_loss ? 1 : 0,
      weakness: formValue.weakness ? 1 : 0,
      Polyphagia: formValue.Polyphagia ? 1 : 0,
      Genital_thrush: formValue.Genital_thrush ? 1 : 0,
      visual_blurring: formValue.visual_blurring ? 1 : 0,
      Itching: formValue.Itching ? 1 : 0,
      Irritability: formValue.Irritability ? 1 : 0,
      delayed_healing: formValue.delayed_healing ? 1 : 0,
      partial_paresis: formValue.partial_paresis ? 1 : 0,
      muscle_stiffness: formValue.muscle_stiffness ? 1 : 0,
      Alopecia: formValue.Alopecia ? 1 : 0,
      Obesity: formValue.Obesity ? 1 : 0,
    };

    this.predictionService.predict(payload).subscribe({
      next: (response) => {
        this.result = response;
        this.showResult = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    this.predictionForm.reset({
      Polyuria: 0,
      Polydipsia: 0,
      sudden_weight_loss: 0,
      weakness: 0,
      Polyphagia: 0,
      Genital_thrush: 0,
      visual_blurring: 0,
      Itching: 0,
      Irritability: 0,
      delayed_healing: 0,
      partial_paresis: 0,
      muscle_stiffness: 0,
      Alopecia: 0,
      Obesity: 0
    });
    this.result = null;
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
}