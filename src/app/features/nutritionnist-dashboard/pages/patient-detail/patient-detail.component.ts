import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NutritionService } from '../../../../services/nutrition.service';
import { FoodEntry, PatientNutritionProfile } from '../../../../models/diet-plan.model';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.css']
})
export class PatientDetailComponent implements OnInit, OnDestroy {

  patientId: number | null = null;
  nutritionistId: number | null = null;
  nutritionistName: string = '';

  // ── Profil nutrition ─────────────────────────────────────────────
  profile: PatientNutritionProfile | null = null;
  imc: number | null = null;
  imcCategory = '';
  imcColor = '';
  isLoadingProfile = true;

  // ── Historique repas ────────────────────────────────────────────
  foodHistory: FoodEntry[] = [];
  isLoadingHistory = true;

  activeTab: 'profile' | 'history' = 'profile';

  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private nutritionService: NutritionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // ✅ Récupérer l'ID du nutritionniste connecté
      this.loadNutritionistInfo();
      
      this.routeSub = this.route.params.subscribe(params => {
        const patientIdFromUrl = params['id'];
        if (patientIdFromUrl) {
          this.patientId = +patientIdFromUrl;
          this.loadProfile();
          this.loadFoodHistory();
        } else {
          console.error('❌ Aucun patient sélectionné');
          this.goBack();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  // ✅ Charger les informations du nutritionniste connecté
  loadNutritionistInfo(): void {
    const nutritionistIdStr = localStorage.getItem('nutritionist_id');
    const firstName = localStorage.getItem('nutritionist_firstName');
    const lastName = localStorage.getItem('nutritionist_lastName');
    
    if (nutritionistIdStr) {
      this.nutritionistId = parseInt(nutritionistIdStr);
      console.log('✅ Nutritionniste connecté ID:', this.nutritionistId);
      
      if (firstName && lastName) {
        this.nutritionistName = `${firstName} ${lastName}`;
      } else if (firstName) {
        this.nutritionistName = firstName;
      } else {
        this.nutritionistName = 'Nutritionniste';
      }
    } else {
      console.error('❌ Aucun nutritionniste connecté');
      setTimeout(() => {
        this.router.navigate(['/auth/nutritionist']);
      }, 2000);
    }
  }

  // ── Charger profil nutrition du patient ─────────────────────────
  loadProfile(): void {
    if (!this.patientId) return;
    
    this.isLoadingProfile = true;
    this.nutritionService.getNutritionProfile(this.patientId).subscribe({
      next: (data: PatientNutritionProfile) => {
        if (data?.id) {
          this.profile = data;
          this.calculateIMC();
        }
        this.isLoadingProfile = false;
      },
      error: (err) => {
        console.error('❌ Pas de profil nutrition pour ce patient', err);
        this.isLoadingProfile = false;
      }
    });
  }

  // ── Charger historique repas ───────────────────────────────────
  loadFoodHistory(): void {
    if (!this.patientId) return;
    
    this.isLoadingHistory = true;
    this.nutritionService.getFoodHistoryByPatient(this.patientId).subscribe({
      next: (entries: FoodEntry[]) => {
        this.foodHistory = entries.map(e => ({
          ...e,
          parsedResult: this.nutritionService.parseAnalysisResult(e) || undefined
        }));
        this.isLoadingHistory = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement historique', err);
        this.isLoadingHistory = false;
      }
    });
  }

  // ── Calcul IMC ────────────────────────────────────────────────
  calculateIMC(): void {
    if (!this.profile?.weight || !this.profile?.height) return;

    const heightM = this.profile.height / 100;
    this.imc = Math.round((this.profile.weight / (heightM * heightM)) * 10) / 10;

    if (this.imc < 18.5) {
      this.imcCategory = 'Insuffisance pondérale';
      this.imcColor = '#3b82f6';
    } else if (this.imc < 25) {
      this.imcCategory = 'Poids normal';
      this.imcColor = '#10b981';
    } else if (this.imc < 30) {
      this.imcCategory = 'Surpoids';
      this.imcColor = '#f59e0b';
    } else {
      this.imcCategory = 'Obésité';
      this.imcColor = '#ef4444';
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  getTotals(foods: any[]): any {
    return this.nutritionService.getTotals(foods);
  }

  getCarbsAlert(carbs: number): string {
    if (carbs > 45) return 'danger';
    if (carbs > 30) return 'warning';
    return 'success';
  }

  getCarbsColor(carbs: number): string {
    if (carbs > 45) return '#ef4444';
    if (carbs > 30) return '#f59e0b';
    return '#10b981';
  }

  getHba1cStatus(): string {
    const hba1c = this.profile?.hba1c;
    if (hba1c == null) return '';
    if (hba1c < 5.7) return 'normal';
    if (hba1c < 6.5) return 'prediabetes';
    return 'diabetes';
  }

  setTab(tab: 'profile' | 'history'): void {
    this.activeTab = tab;
  }

  // ── Navigation ───────────────────────────────────────────────
  goBack(): void {
    this.router.navigate(['/nutritionnist/patients']);
  }

  goToCreatePlan(): void {
    if (!this.patientId) return;
    this.router.navigate(['/nutritionnist/plan-create'], {
      queryParams: { patientId: this.patientId }
    });
  }
  getPatientDisplayName(): string {
  if (this.profile?.firstName && this.profile?.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return `Patient #${this.patientId}`;
}
}