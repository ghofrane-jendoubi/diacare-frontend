import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionistAuthComponent } from './nutritionist-auth.component';

describe('NutritionistAuthComponent', () => {
  let component: NutritionistAuthComponent;
  let fixture: ComponentFixture<NutritionistAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NutritionistAuthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionistAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
