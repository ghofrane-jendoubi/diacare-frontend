import { Component, OnInit } from '@angular/core';
import { IaDashboardService } from '../../src/app/features/patient-home/services/ia-dashboard.service';

@Component({
  selector: 'app-ia-dashboard',
  templateUrl: './ia-dashboard.component.html',
  styleUrls: ['./ia-dashboard.component.css']
})
export class IaDashboardComponent implements OnInit {

  isLoading = true;
  dashboard: any = null;
  showAddForm = false;
  isSaving = false;

  newMesure = {
    valeur: 1.2,
    moment: 'A_JEUN',
    notes: ''
  };

  moments = [
    { value: 'A_JEUN',       label: '🌅 À jeun' },
    { value: 'AVANT_REPAS',  label: '🍽️ Avant repas' },
    { value: 'APRES_REPAS',  label: '🍴 Après repas' },
    { value: 'AVANT_DODO',   label: '🌙 Avant de dormir' },
    { value: 'AUTRE',        label: '⏰ Autre moment' }
  ];

  constructor(private iaService: IaDashboardService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.isLoading = true;
    this.iaService.getDashboard(1).subscribe({
      next: (data) => {
        this.dashboard = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur dashboard IA:', err);
        this.isLoading = false;
      }
    });
  }

  ajouterMesure() {
    if (!this.newMesure.valeur) return;
    this.isSaving = true;
    this.iaService.addMesure(
      1,
      this.newMesure.valeur,
      this.newMesure.moment,
      this.newMesure.notes
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAddForm = false;
        this.newMesure = { valeur: 1.2, moment: 'A_JEUN', notes: '' };
        this.loadDashboard();
      },
      error: (err) => {
        console.error('Erreur ajout:', err);
        this.isSaving = false;
      }
    });
  }

  getGlycemieColor(valeur: number): string {
    if (valeur < 0.7) return '#7c3aed';
    if (valeur <= 1.3) return '#16a34a';
    if (valeur <= 2.0) return '#f59e0b';
    return '#dc2626';
  }

  getScoreLabel(score: number): string {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Correct';
    if (score >= 25) return 'À améliorer';
    return 'Insuffisant';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }

  get chartData(): { x: number; y: number; color: string }[] {
    if (!this.dashboard?.historique) return [];
    return [...this.dashboard.historique]
      .reverse()
      .slice(-7)
      .map((r: any, i: number) => ({
        x: i,
        y: r.valeur,
        color: this.getGlycemieColor(r.valeur)
      }));
  }

  getChartPath(): string {
    const data = this.chartData;
    if (data.length < 2) return '';
    const w = 300, h = 100;
    const maxV = Math.max(...data.map(d => d.y), 2.5);
    const minV = 0.5;
    const points = data.map((d, i) => {
      const px = (i / (data.length - 1)) * w;
      const py = h - ((d.y - minV) / (maxV - minV)) * h;
      return `${px},${py}`;
    });
    return `M ${points.join(' L ')}`;
  }
}