import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientChatComponent } from './patient-chat.component';

describe('PatientChatComponent', () => {
  let component: PatientChatComponent;
  let fixture: ComponentFixture<PatientChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
