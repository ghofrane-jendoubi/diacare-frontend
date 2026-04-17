import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-nutritionnist-sidebar',
  templateUrl: './nutritionnist-sidebar.component.html',
  styleUrls: ['./nutritionnist-sidebar.component.css']
})
export class NutritionnistSidebarComponent {
  @Input() isCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<boolean>();

  onToggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.toggleSidebar.emit(this.isCollapsed);
    
    // Ajouter une classe au body pour les animations
    if (this.isCollapsed) {
      document.body.classList.add('sidebar-nutri-collapsed');
    } else {
      document.body.classList.remove('sidebar-nutri-collapsed');
    }
  }
}