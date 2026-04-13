// progress.component.ts
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NutritionService } from '../../../../services/nutrition.service';

interface DayData {
  label:   string;
  isToday: boolean;
  carbs:   number;
  entries: number;
}

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls:   ['./progress.component.css']
})
export class ProgressComponent implements OnInit {

  patientId   = 1;
  targetCarbs = 180;
  weekData:   DayData[] = [];
  isLoading   = true;

  hasNoData = false;
  hasData   = false;

  readonly W = 600;
  readonly H = 180;

  get grid1(): number      { return this.H * 0.25; }
  get grid2(): number      { return this.H * 0.5;  }
  get grid3(): number      { return this.H * 0.75; }
  get labelRectX(): number { return this.W - 90;   }
  get labelTextX(): number { return this.W - 46;   }
  get objRectY(): number   { return this.getObjectiveY() - 16; }
  get objTextY(): number   { return this.getObjectiveY() - 5;  }
  get emptyDotY(): number  { return this.H - 8; }

  getPtLabelY(y: number): number { return y - 12; }

  constructor(
    private nutritionService: NutritionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProfile();
      this.loadHistory();
    }
  }

  loadProfile(): void {
    this.nutritionService.getNutritionProfile(this.patientId).subscribe({
      next: (d) => {
        if (d?.targetCarbs) this.targetCarbs = d.targetCarbs;
      }
    });
  }

  loadHistory(): void {
    this.isLoading = true;
    this.nutritionService.getFoodHistoryByPatient(this.patientId).subscribe({
      next: (entries) => {
        console.log('Entries reçues:', entries.length, entries[0]); // ← debug

        const parsed = entries
          .map(e => ({
            ...e,
            res: this.nutritionService.parseAnalysisResult(e)
          }))
          .filter(e => (e.res?.foods?.length ?? 0) > 0);

        console.log('Entries parsées:', parsed.length); // ← debug

        this.buildWeek(parsed);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur loadHistory:', err);
        this.isLoading = false;
      }
    });
  }

  buildWeek(entries: any[]): void {
    const labels = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
    this.weekData = [];

    for (let i = 6; i >= 0; i--) {
      const d    = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toDateString();

      // ← Parsing robuste de la date (supporte plusieurs formats)
      const dayE = entries.filter(e => {
        if (!e.createdAt) return false;
        try {
          // Spring Boot peut retourner : "2024-03-22T20:48:00" ou "2024-03-22T20:48:00.000Z"
          const entryDate = new Date(e.createdAt);
          return entryDate.toDateString() === dStr;
        } catch {
          return false;
        }
      });

      let carbs = 0;
      dayE.forEach(e => {
        const t = this.nutritionService.getTotals(e.res.foods);
        carbs += t.carbs;
      });

      this.weekData.push({
        label:   i === 0 ? 'Auj.' : labels[d.getDay()],
        isToday: i === 0,
        carbs:   Math.round(carbs),
        entries: dayE.length
      });
    }

    console.log('WeekData:', this.weekData); // ← debug

    this.hasNoData = this.weekData.every(d => d.entries === 0);
    this.hasData   = this.weekData.some(d => d.entries > 0);
  }

  // ── SVG ───────────────────────────────────────────────────
  getMaxY(): number {
    return Math.max(this.targetCarbs * 1.4, ...this.weekData.map(d => d.carbs), 10);
  }

  getObjectiveY(): number {
    return this.H - (this.targetCarbs / this.getMaxY()) * this.H;
  }

  getPoints(): { x: number; y: number; carbs: number }[] {
    const step = this.W / Math.max(this.weekData.length - 1, 1);
    const maxY = this.getMaxY();
    return this.weekData.map((d, i) => ({
      x:     i * step,
      y:     d.entries > 0 ? this.H - (d.carbs / maxY) * this.H : this.H,
      carbs: d.carbs
    }));
  }

  getCurvePath(): string {
    const pts = this.getPoints();
    if (this.hasNoData) return '';
    return pts.map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const cx   = (prev.x + p.x) / 2;
      return `C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
    }).join(' ');
  }

  getAreaPath(): string {
    const curve = this.getCurvePath();
    if (!curve) return '';
    const pts  = this.getPoints();
    const last = pts[pts.length - 1];
    return `${curve} L ${last.x} ${this.H} L 0 ${this.H} Z`;
  }

  // ── Helpers ───────────────────────────────────────────────
  pointColor(d: DayData): string {
    if (d.entries === 0)                        return '#e5e7eb';
    if (d.carbs > this.targetCarbs)             return '#ef4444';
    if (d.carbs > this.targetCarbs * 0.85)      return '#f59e0b';
    return '#3b82f6';
  }

  getDayStatus(d: DayData): string {
    if (d.entries === 0)                   return '—';
    if (d.carbs > this.targetCarbs)        return '🔴';
    if (d.carbs > this.targetCarbs * 0.85) return '⚠️';
    return '✅';
  }

  getDiff(d: DayData): string {
    if (d.entries === 0) return '';
    const diff = d.carbs - this.targetCarbs;
    return diff > 0 ? `+${diff}g` : `${diff}g`;
  }

  getDiffColor(d: DayData): string {
    return d.carbs > this.targetCarbs ? '#ef4444' : '#3b82f6';
  }

  countOk():     number { return this.weekData.filter(d => d.entries > 0 && d.carbs <= this.targetCarbs).length; }
  countWarn():   number { return this.weekData.filter(d => d.entries > 0 && d.carbs > this.targetCarbs * 0.85 && d.carbs <= this.targetCarbs).length; }
  countDanger(): number { return this.weekData.filter(d => d.carbs > this.targetCarbs).length; }

  getAvgCarbs(): number {
    const active = this.weekData.filter(d => d.entries > 0);
    if (!active.length) return 0;
    return Math.round(active.reduce((s, d) => s + d.carbs, 0) / active.length);
  }

  getComplianceScore(): number {
    const ok = this.weekData.filter(d => d.entries > 0 && d.carbs <= this.targetCarbs * 1.1).length;
    return Math.round((ok / 7) * 100);
  }

  getComplianceColor(): string {
    const s = this.getComplianceScore();
    if (s >= 70) return '#3b82f6';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  }
}