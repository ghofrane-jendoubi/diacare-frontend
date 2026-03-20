import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodChatComponent } from './food-chat.component';

describe('FoodChatComponent', () => {
  let component: FoodChatComponent;
  let fixture: ComponentFixture<FoodChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FoodChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoodChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
