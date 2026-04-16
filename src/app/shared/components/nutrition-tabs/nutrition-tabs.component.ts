// nutrition-tabs.component.ts
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChatNutritionService } from '../../../services/chatnutrition.service';

@Component({
  selector: 'app-nutrition-tabs',
  templateUrl: './nutrition-tabs.component.html',
  styleUrls: ['./nutrition-tabs.component.css']
})
export class NutritionTabsComponent implements OnInit, OnDestroy {

  unreadCount = 0;
  patientId = 1;
  isVisible = false;

  private pollSub?: Subscription;

  constructor(
    private chatService: ChatNutritionService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Vérifier la route actuelle
    this.checkVisibility(this.router.url);
    
    // Écouter les changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkVisibility(event.url);
    });

    if (isPlatformBrowser(this.platformId)) {
      this.loadUnread();
      this.pollSub = interval(10000).pipe(
        switchMap(() => this.chatService.countUnread(this.patientId))
      ).subscribe({
        next: (count: number) => this.unreadCount = count
      });
    }
  }

  checkVisibility(url: string): void {
    const nutritionRoutes = ['/patient/nutrition', '/patient/my-plans', '/patient/profile', '/patient/progress', '/patient/nutrition-chat'];
    this.isVisible = nutritionRoutes.some(route => url.includes(route));
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  loadUnread(): void {
    this.chatService.countUnread(this.patientId).subscribe({
      next: (count: number) => this.unreadCount = count,
      error: () => this.unreadCount = 0
    });
  }
}