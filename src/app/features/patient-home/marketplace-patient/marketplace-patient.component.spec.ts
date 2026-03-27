import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplacePatientComponent } from './marketplace-patient.component';

describe('MarketplacePatientComponent', () => {
  let component: MarketplacePatientComponent;
  let fixture: ComponentFixture<MarketplacePatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarketplacePatientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketplacePatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
