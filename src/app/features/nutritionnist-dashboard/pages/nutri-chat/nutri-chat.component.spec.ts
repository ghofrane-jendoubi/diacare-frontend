import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutriChatComponent } from './nutri-chat.component';

describe('NutriChatComponent', () => {
  let component: NutriChatComponent;
  let fixture: ComponentFixture<NutriChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NutriChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutriChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
