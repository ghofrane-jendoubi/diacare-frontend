// nutrition-tabs.component.ts
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
// ← chemin correct depuis shared/components/nutrition-tabs/
import { ChatNutritionService } from '../../../services/chatnutrition.service';

@Component({                          // ← @Component obligatoire pour SharedModule
  selector: 'app-nutrition-tabs',
  templateUrl: './nutrition-tabs.component.html',
  styleUrls: ['./nutrition-tabs.component.css']
})
export class NutritionTabsComponent implements OnInit, OnDestroy {

  unreadCount = 0;
  patientId   = 1;

  private pollSub?: Subscription;

  constructor(
    private chatService: ChatNutritionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUnread();
      this.pollSub = interval(10000).pipe(
        switchMap(() => this.chatService.countUnread(this.patientId))
      ).subscribe({
        next: (count: number) => this.unreadCount = count  // ← type explicite
      });
    }
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  loadUnread(): void {
    this.chatService.countUnread(this.patientId).subscribe({
      next: (count: number) => this.unreadCount = count,  // ← type explicite
      error: () => this.unreadCount = 0
    });
  }
}