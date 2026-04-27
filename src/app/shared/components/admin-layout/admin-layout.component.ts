import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  isSidebarCollapsed = false;
  showTopbar = true;

  ngOnInit() {
    // Vérifier si topbar existe et éviter les doublons
    this.checkForSidebarDuplicates();
  }

  onSidebarToggled(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
    this.updateBodyClass(collapsed);
  }

  private updateBodyClass(collapsed: boolean) {
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
      document.body.classList.remove('sidebar-expanded');
    } else {
      document.body.classList.add('sidebar-expanded');
      document.body.classList.remove('sidebar-collapsed');
    }
  }

  private checkForSidebarDuplicates() {
    // Nettoyer les sidebars dupliquées
    setTimeout(() => {
      const sidebars = document.querySelectorAll('app-sidebar');
      if (sidebars.length > 1) {
        console.warn('Multiple sidebars detected!', sidebars.length);
        // Garder seulement le premier sidebar
        for (let i = 1; i < sidebars.length; i++) {
          sidebars[i].remove();
        }
      }
    }, 100);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth <= 768) {
      this.isSidebarCollapsed = true;
      this.updateBodyClass(true);
    }
  }
}