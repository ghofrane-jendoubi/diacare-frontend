// nutrition-tabs.component.ts
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
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

  @Output() visibilityChange = new EventEmitter<boolean>();

  private pollSub?: Subscription;

  constructor(
    private chatService: ChatNutritionService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.patientId = user.id;
    }

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
    const id = localStorage.getItem('selected_nutritionist_id');
    if (id) {
      this.nutritionistId = parseInt(id);
    }
    const match = this.router.url.match(/nutrition-chat\/(\d+)/);
    if (match) {
      this.nutritionistId = parseInt(match[1]);
      localStorage.setItem('selected_nutritionist_id', match[1]);
    }
  }

  checkVisibility(url: string): void {
    // Routes où la sidebar nutrition doit apparaître
    const routesWithSidebar = [
      '/patient/nutrition-chat',
      '/patient/my-plans', 
      '/patient/profile',
      '/patient/progress',
      '/patient/nutrition'
    ];
    
    const isRouteWithSidebar = routesWithSidebar.some(route => url.includes(route));
    const isNutritionistsPage = url.includes('/patient/nutritionists');
    
    const newVisibility = isRouteWithSidebar && !isNutritionistsPage;
    
    if (this.isVisible !== newVisibility) {
      this.isVisible = newVisibility;
      this.visibilityChange.emit(this.isVisible);
    }
  }

  loadUnread(): void {
    if (!this.patientId) return;
    this.chatService.countUnread(this.patientId).subscribe({
      next: (count: number) => this.unreadCount = count,
      error: () => this.unreadCount = 0
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }
}