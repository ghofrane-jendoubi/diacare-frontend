import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionnistLayoutComponent } from './nutritionnist-layout.component';

describe('NutritionnistLayoutComponent', () => {
  let component: NutritionnistLayoutComponent;
  let fixture: ComponentFixture<NutritionnistLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NutritionnistLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionnistLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
