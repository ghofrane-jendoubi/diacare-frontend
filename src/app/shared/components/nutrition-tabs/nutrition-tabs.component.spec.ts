import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionTabsComponent } from './nutrition-tabs.component';

describe('NutritionTabsComponent', () => {
  let component: NutritionTabsComponent;
  let fixture: ComponentFixture<NutritionTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NutritionTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
