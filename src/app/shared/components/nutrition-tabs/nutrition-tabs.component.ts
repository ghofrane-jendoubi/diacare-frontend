// nutrition-tabs.component.ts
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChatNutritionService } from '../../../services/chatnutrition.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-nutrition-tabs',
  templateUrl: './nutrition-tabs.component.html',
  styleUrls: ['./nutrition-tabs.component.css']
})
export class NutritionTabsComponent implements OnInit, OnDestroy {

  unreadCount = 0;
  patientId: number | null = null;
  nutritionistId: number | null = null;
  isVisible = false;

  private pollSub?: Subscription;

  constructor(
    private chatService: ChatNutritionService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // ✅ Récupérer le patientId depuis AuthService
    const user = this.authService.getCurrentUser();
    if (user) {
      this.patientId = user.id;
    }

    // ✅ Récupérer le nutritionistId depuis localStorage
    this.loadNutritionistId();

    this.checkVisibility(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkVisibility(event.url);
      this.loadNutritionistId();
    });

    if (isPlatformBrowser(this.platformId) && this.patientId) {
      this.loadUnread();
      this.pollSub = interval(10000).pipe(
        switchMap(() => this.chatService.countUnread(this.patientId!))
      ).subscribe({
        next: (count: number) => this.unreadCount = count
      });
    }
  }

  loadNutritionistId(): void {
    // Lire depuis localStorage
    const id = localStorage.getItem('selected_nutritionist_id');
    if (id) {
      this.nutritionistId = parseInt(id);
    }
    // Ou extraire depuis l'URL courante
    const match = this.router.url.match(/nutrition-chat\/(\d+)/);
    if (match) {
      this.nutritionistId = parseInt(match[1]);
      localStorage.setItem('selected_nutritionist_id', match[1]);
    }
  }

  // nutrition-tabs.component.ts
checkVisibility(url: string): void {
  const routesWithSidebar = [
    '/patient/nutrition-chat',
    '/patient/my-plans', 
    '/patient/profile',
    '/patient/progress',
    '/patient/nutrition'
  ];
  
  const isRouteWithSidebar = routesWithSidebar.some(route => url.includes(route));
  const isNutritionistsPage = url.includes('/patient/nutritionists');
  
  this.isVisible = isRouteWithSidebar && !isNutritionistsPage;
  
  console.log('NutritionTabs isVisible:', this.isVisible, 'URL:', url);
}

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  loadUnread(): void {
    if (!this.patientId) return;
    this.chatService.countUnread(this.patientId).subscribe({
      next: (count: number) => this.unreadCount = count,
      error: () => this.unreadCount = 0
    });
  }
}