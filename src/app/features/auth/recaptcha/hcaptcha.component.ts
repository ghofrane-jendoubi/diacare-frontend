import { Component, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';

declare const hcaptcha: any;

@Component({
  selector: 'app-hcaptcha',
  template: `
    <div class="hcaptcha-container">
      <div #hcaptchaElement class="h-captcha" [attr.data-sitekey]="siteKey"></div>
      <div class="captcha-error" *ngIf="error">
        <i class="bi bi-exclamation-triangle-fill"></i> 
        Veuillez compléter la vérification
      </div>
    </div>
  `,
  styles: [`
    .hcaptcha-container {
      margin: 15px 0;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
    }
    .captcha-error {
      color: #dc2626;
      font-size: 12px;
      margin-top: 8px;
      text-align: center;
    }
  `]
})
export class HcaptchaComponent implements AfterViewInit {
  // ✅ Utiliser la DEUXIÈME sitekey (celle avec 26 inscriptions)
  @Input() siteKey = 'd5984916-a77a-4a90-b02c-c97acbaea310';
  @Output() resolved = new EventEmitter<string>();
  @Output() expired = new EventEmitter<void>();

  @ViewChild('hcaptchaElement', { static: true }) hcaptchaElement!: ElementRef;

  error = false;
  private widgetId: any;

  ngAfterViewInit(): void {
    this.loadHCaptcha();
  }

  loadHCaptcha(): void {
    if (typeof hcaptcha !== 'undefined') {
      this.renderWidget();
    } else {
      const checkInterval = setInterval(() => {
        if (typeof hcaptcha !== 'undefined') {
          clearInterval(checkInterval);
          this.renderWidget();
        }
      }, 100);
    }
  }

  renderWidget(): void {
    this.widgetId = hcaptcha.render(this.hcaptchaElement.nativeElement, {
      sitekey: this.siteKey,
      callback: (response: string) => {
        console.log('✅ hCaptcha résolu - Token reçu');
        this.error = false;
        this.resolved.emit(response);
      },
      'expired-callback': () => {
        console.log('⚠️ hCaptcha expiré');
        this.expired.emit();
        this.resolved.emit('');
      },
      theme: 'light'
    });
  }

  reset(): void {
    if (this.widgetId) {
      hcaptcha.reset(this.widgetId);
      this.resolved.emit('');
    }
    this.error = false;
  }

  setError(hasError: boolean): void {
    this.error = hasError;
  }
}