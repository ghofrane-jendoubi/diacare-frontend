import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietPlanViewComponent } from './diet-plan-view.component';

describe('DietPlanViewComponent', () => {
  let component: DietPlanViewComponent;
  let fixture: ComponentFixture<DietPlanViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DietPlanViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DietPlanViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
