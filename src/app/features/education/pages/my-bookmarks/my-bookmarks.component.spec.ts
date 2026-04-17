import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBookmarksComponent } from './my-bookmarks.component';

describe('MyBookmarksComponent', () => {
  let component: MyBookmarksComponent;
  let fixture: ComponentFixture<MyBookmarksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyBookmarksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyBookmarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
