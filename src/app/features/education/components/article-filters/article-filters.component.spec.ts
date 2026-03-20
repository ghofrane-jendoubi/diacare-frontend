import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleFiltersComponent } from './article-filters.component';

describe('ArticleFiltersComponent', () => {
  let component: ArticleFiltersComponent;
  let fixture: ComponentFixture<ArticleFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArticleFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
