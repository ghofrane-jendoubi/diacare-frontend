import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../../features/doctor-dashboard/services/notification.service';

@Component({
  selector: 'app-doctor-topbar',
  templateUrl: './doctor-topbar.component.html',
  styleUrl: './doctor-topbar.component.css'
})
export class DoctorTopbarComponent implements OnInit {

  unreadCount: number = 0;
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadUnreadCount();
    this.loadNotifications();
  }

  loadUnreadCount() {
    this.notificationService.getUnreadCount().subscribe(count => {
      this.unreadCount = count;
    });
  }

  loadNotifications() {
    this.notificationService.getUnreadNotifications().subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  markAsRead(notificationId: number) {
    this.notificationService.markAsRead(notificationId).subscribe(() => {
      this.loadUnreadCount();
      this.loadNotifications();
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.loadUnreadCount();
      this.loadNotifications();
    });
  }
}
