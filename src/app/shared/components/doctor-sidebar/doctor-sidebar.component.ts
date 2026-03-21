import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-doctor-sidebar',
  templateUrl: './doctor-sidebar.component.html',
  styleUrls: ['./doctor-sidebar.component.css']
})
export class DoctorSidebarComponent implements OnInit {

  unreadMessages = 0;

  ngOnInit() {
    // Tu pourras connecter ça au service plus tard
    this.unreadMessages = 0;
  }
}