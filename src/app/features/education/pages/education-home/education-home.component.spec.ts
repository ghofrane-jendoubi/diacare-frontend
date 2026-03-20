import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationHomeComponent } from './education-home.component';

describe('EducationHomeComponent', () => {
  let component: EducationHomeComponent;
  let fixture: ComponentFixture<EducationHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EducationHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EducationHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
