import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AppointmentService } from '../../../../services/appointment.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  @ViewChild('calendar') calendarComponent: any;

  doctorId = 4; // ID du médecin connecté
  patients: any[] = [];
  selectedDate: Date = new Date();
  showForm = false;
  editingAppointment: any = null;

  // Formulaire
  appointmentForm = {
    patientId: null as number | null,
    title: '',
    date: '',
    time: '',
    duration: 30,
    type: 'online',
    meetLink: '',
    description: '',
    status: 'planifié'
  };

  // Options du calendrier
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    height: 'auto',
    datesSet: (dateInfo) => {
      this.loadAppointments(dateInfo.start, dateInfo.end);
    },
    eventClick: this.handleEventClick.bind(this),
    select: this.handleDateSelect.bind(this),
    eventDidMount: (info) => {
      this.colorEventByStatus(info);
    }
  };

  events: any[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadPatients();
    this.loadAppointments(new Date(), new Date());
  }

  // ===== CHARGEMENT DES DONNÉES =====

  loadPatients() {
    this.appointmentService.getPatientsWithConversations(this.doctorId).subscribe({
      next: (data) => {
        this.patients = data;
      },
      error: (err) => {
        console.error('Erreur chargement patients:', err);
      }
    });
  }

  loadAppointments(start: Date | null, end: Date | null) {
    this.appointmentService.getDoctorAppointments(this.doctorId).subscribe({
      next: (data) => {
        this.events = this.mapAppointmentsToEvents(data);
      },
      error: (err) => {
        console.error('Erreur chargement rendez-vous:', err);
      }
    });
  }

  // ===== MAPPAGE DES ÉVÉNEMENTS =====

  mapAppointmentsToEvents(appointments: any[]): any[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return appointments.map(app => {
      const startDate = new Date(app.startTime);
      const endDate = new Date(app.endTime);
      const startDay = new Date(startDate);
      startDay.setHours(0, 0, 0, 0);
      
      let status = 'futur';
      if (startDate < new Date()) {
        status = 'passé';
      }
      if (startDay.getTime() === today.getTime()) {
        status = 'aujourd\'hui';
      }
      if (app.status === 'annulé') {
        status = 'annulé';
      }
      
      return {
        id: app.id,
        title: `${app.patientName} - ${app.title}`,
        start: app.startTime,
        end: app.endTime,
        extendedProps: {
          patientId: app.patient?.id,
          patientName: app.patientName,
          description: app.description,
          meetLink: app.meetLink,
          status: status,
          type: app.type
        }
      };
    });
  }

  // ===== GESTION DES ÉVÉNEMENTS CALENDRIER =====

  handleEventClick(clickInfo: EventClickArg) {
    const event = clickInfo.event;
    this.editingAppointment = {
      id: event.id,
      patientId: event.extendedProps['patientId'],
      title: event.title.split(' - ')[1] || event.title,
      date: this.formatDateForInput(event.start || new Date()),
      time: this.formatTimeForInput(event.start || new Date()),
      duration: this.calculateDuration(event.start || new Date(), event.end || new Date()),
      type: event.extendedProps['type'] || 'online',
      meetLink: event.extendedProps['meetLink'] || '',
      description: event.extendedProps['description'] || '',
      status: event.extendedProps['status'] || 'planifié'
    };
    this.showForm = true;
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    this.selectedDate = selectInfo.start;
    this.resetForm();
    this.appointmentForm.date = this.formatDateForInput(selectInfo.start);
    this.appointmentForm.time = this.formatTimeForInput(selectInfo.start);
    this.showForm = true;
  }

  // ===== GESTION DU FORMULAIRE =====

  resetForm() {
    this.editingAppointment = null;
    this.appointmentForm = {
      patientId: null,
      title: '',
      date: '',
      time: '',
      duration: 30,
      type: 'online',
      meetLink: '',
      description: '',
      status: 'planifié'
    };
  }

  saveAppointment() {
    if (!this.appointmentForm.patientId || !this.appointmentForm.title || !this.appointmentForm.date || !this.appointmentForm.time) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const patient = this.patients.find(p => p.id === this.appointmentForm.patientId);
    
    const start = new Date(`${this.appointmentForm.date}T${this.appointmentForm.time}`);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + this.appointmentForm.duration);

    const appointmentData = {
      doctorId: this.doctorId,
      patientId: this.appointmentForm.patientId,
      patientName: patient?.firstName + ' ' + patient?.lastName,
      title: this.appointmentForm.title,
      start: start.toISOString(),
      end: end.toISOString(),
      description: this.appointmentForm.description,
      type: this.appointmentForm.type,
      meetLink: this.appointmentForm.type === 'online' ? this.generateMeetLink() : null,
      status: 'planifié'
    };

    const request = this.editingAppointment
      ? this.appointmentService.updateAppointment(this.editingAppointment.id, appointmentData)
      : this.appointmentService.createAppointment(appointmentData);

    request.subscribe({
    next: (savedAppointment) => {
      // ✅ CORRECTION: Envoyer le bon lien
      this.notificationService.sendNotification(
        this.appointmentForm.patientId!,
        'Nouveau rendez-vous',
        `Votre rendez-vous "${this.appointmentForm.title}" est planifié pour le ${this.formatDate(start)} à ${this.formatTime(start)}`,
        '/patient/appointments'  // ← Ce chemin doit correspondre à la route Angular
      ).subscribe();

      this.loadAppointments(new Date(), new Date());
      this.showForm = false;
      this.resetForm();
      
      alert(this.editingAppointment ? 'Rendez-vous modifié avec succès' : 'Rendez-vous créé avec succès');
    },
    error: (err) => {
      console.error('Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde');
    }
  });
  }

  deleteAppointment() {
    if (!this.editingAppointment) return;
    
    if (confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      this.appointmentService.deleteAppointment(this.editingAppointment.id).subscribe({
        next: () => {
          this.loadAppointments(new Date(), new Date());
          this.showForm = false;
          this.resetForm();
          alert('Rendez-vous annulé');
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  cancelForm() {
    this.showForm = false;
    this.resetForm();
  }

  // ===== UTILITAIRES =====

  formatDateForInput(date: Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  formatTimeForInput(date: Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toTimeString().slice(0, 5);
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateDuration(start: Date | null, end: Date | null): number {
    if (!start || !end) return 30;
    return (end.getTime() - start.getTime()) / (1000 * 60);
  }

  generateMeetLink(): string {
    const meetingId = Math.random().toString(36).substring(2, 10);
    return `https://meet.google.com/${meetingId}`;
  }

  colorEventByStatus(info: any) {
    const status = info.event.extendedProps['status'];
    if (status === 'passé') {
      info.el.style.backgroundColor = '#fbbf24';
      info.el.style.borderColor = '#f59e0b';
    } else if (status === 'aujourd\'hui') {
      info.el.style.backgroundColor = '#10b981';
      info.el.style.borderColor = '#059669';
    } else if (status === 'futur') {
      info.el.style.backgroundColor = '#3b82f6';
      info.el.style.borderColor = '#2563eb';
    } else if (status === 'annulé') {
      info.el.style.backgroundColor = '#ef4444';
      info.el.style.borderColor = '#dc2626';
    }
  }
}