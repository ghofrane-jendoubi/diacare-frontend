import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'diacare-frontend';
  private storageListener: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Only add event listener when running in a browser
    if (isPlatformBrowser(this.platformId)) {
      this.storageListener = (event: StorageEvent) => {
        if (event.key === 'orderConfirmed' && event.newValue) {
          const data = JSON.parse(event.newValue);
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 }
          });
          localStorage.removeItem('orderConfirmed');
        }
      };
      window.addEventListener('storage', this.storageListener);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
  }
}