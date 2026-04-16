import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAuthComponent } from './patient-auth.component';
import { beforeEach, describe, it } from 'node:test';

describe('PatientAuthComponent', () => {
  let component: PatientAuthComponent;
  let fixture: ComponentFixture<PatientAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientAuthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
function expect(component: PatientAuthComponent) {
  throw new Error('Function not implemented.');
}

