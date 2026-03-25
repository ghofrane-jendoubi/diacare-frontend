import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NutritionService } from '../../../../services/nutrition.service';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.css']
})
export class PatientProfileComponent implements OnInit {

  // ─── Profil ───────────────────────────────────────────────
  profile = {
    weight:        null as number | null,
    height:        null as number | null,
    age:           null as number | null,
    gender:        'male',
    diabetesType:  'type2',
    hba1c:         null as number | null,
    activityLevel: 'light'
  };

  // ─── Résultats calculés ───────────────────────────────────
  imc:           number | null = null;
  imcCategory:   string = '';
  imcColor:      string = '';
  dailyCalories: number | null = null;
  dailyCarbs:    number | null = null;
  carbsPerMeal:  number | null = null;

  // ─── UI ───────────────────────────────────────────────────
  saved:     boolean = false;
  isEditing: boolean = true;
  profileId: number | null = null;

  // ─── patientId ────────────────────────────────────────────
  // Maintenant : hardcodé à 1
  // Après intégration AuthService → remplacer par :
  // const user = JSON.parse(localStorage.getItem('user') || '{}');
  // this.patientId = user?.id || 1;
  patientId: number = 1;

  activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light:     1.375,
    moderate:  1.55,
    active:    1.725
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private nutritionService: NutritionService
  ) {}

  // ─── Lifecycle ────────────────────────────────────────────
  ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    this.loadProfileFromApi();
  }
}

  // ─── CRUD ─────────────────────────────────────────────────

  loadProfileFromApi(): void {
    this.nutritionService.getNutritionProfile(this.patientId)
      .subscribe({
        next: (data) => {
          if (data?.id) {
            this.profileId             = data.id;
            this.profile.weight        = data.weight;
            this.profile.height        = data.height;
            this.profile.age           = data.age;
            this.profile.gender        = data.gender        || 'male';
            this.profile.diabetesType  = data.diabetesType  || 'type2';
            this.profile.hba1c         = data.hba1c;
            this.profile.activityLevel = data.activityLevel || 'light';
            this.isEditing             = false;
            this.calculateAll();
          }
        },
        error: () => console.log('Aucun profil nutrition trouvé')
      });
  }

  saveProfile(): void {
    this.calculateAll();

    const data = {
      id:            this.profileId || null,
      patientId:     this.patientId,
      weight:        this.profile.weight,
      height:        this.profile.height,
      age:           this.profile.age,
      gender:        this.profile.gender,
      diabetesType:  this.profile.diabetesType,
      hba1c:         this.profile.hba1c,
      activityLevel: this.profile.activityLevel
    };

    this.nutritionService.saveNutritionProfile(data).subscribe({
      next: (saved) => {
        this.profileId = saved.id;
        this.saved     = true;
        this.isEditing = false;
        setTimeout(() => this.saved = false, 3000);
      },
      error: (err) => console.error('Erreur sauvegarde', err)
    });
  }

  editProfile(): void {
    this.isEditing = true;
  }

  deleteProfile(): void {
    if (!this.profileId) return;

    this.nutritionService.deleteNutritionProfile(this.profileId).subscribe({
      next: () => {
        this.profile = {
          weight: null, height: null, age: null,
          gender: 'male', diabetesType: 'type2',
          hba1c: null, activityLevel: 'light'
        };
        this.imc           = null;
        this.dailyCalories = null;
        this.dailyCarbs    = null;
        this.carbsPerMeal  = null;
        this.profileId     = null;
        this.isEditing     = true;
      },
      error: (err) => console.error('Erreur suppression', err)
    });
  }

  // ─── Calculs ──────────────────────────────────────────────

  calculateAll(): void {
    this.calculateIMC();
    this.calculateNutritionalNeeds();
  }

  calculateIMC(): void {
    if (!this.profile.weight || !this.profile.height) return;
    const heightM = this.profile.height / 100;
    this.imc = Math.round((this.profile.weight / (heightM * heightM)) * 10) / 10;

    if      (this.imc < 18.5) { this.imcCategory = 'Insuffisance pondérale'; this.imcColor = '#3b82f6'; }
    else if (this.imc < 25)   { this.imcCategory = 'Poids normal';           this.imcColor = '#10b981'; }
    else if (this.imc < 30)   { this.imcCategory = 'Surpoids';               this.imcColor = '#f59e0b'; }
    else                       { this.imcCategory = 'Obésité';                this.imcColor = '#ef4444'; }
  }

  calculateNutritionalNeeds(): void {
    if (!this.profile.weight || !this.profile.height || !this.profile.age) return;

    let bmr: number;
    if (this.profile.gender === 'male') {
      bmr = 10 * this.profile.weight + 6.25 * this.profile.height - 5 * this.profile.age + 5;
    } else {
      bmr = 10 * this.profile.weight + 6.25 * this.profile.height - 5 * this.profile.age - 161;
    }

    const multiplier   = this.activityMultipliers[this.profile.activityLevel] || 1.375;
    this.dailyCalories = Math.round(bmr * multiplier);
    this.dailyCarbs    = Math.round((this.dailyCalories * 0.45) / 4);
    this.carbsPerMeal  = Math.round(this.dailyCarbs / 3);
  }

  // ─── Helpers ──────────────────────────────────────────────

  getImcPercent(): number {
    if (!this.imc) return 0;
    return Math.min((this.imc / 40) * 100, 100);
  }

  getHba1cStatus(): string {
    if (!this.profile.hba1c) return '';
    if (this.profile.hba1c < 5.7) return 'normal';
    if (this.profile.hba1c < 6.5) return 'prediabetes';
    return 'diabetes';
  }
}