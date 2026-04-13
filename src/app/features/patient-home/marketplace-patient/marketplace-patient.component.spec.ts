import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MarketplacePatientComponent } from './marketplace-patient.component';
import { ProductService } from '../../../services/serv-market/product.service';
import { CartService } from '../../../services/serv-market/cart.service';
import { of } from 'rxjs';
import { describe, beforeEach, it } from 'node:test';

describe('MarketplacePatientComponent', () => {
  let component: MarketplacePatientComponent;
  let fixture: ComponentFixture<MarketplacePatientComponent>;

  const mockProductService = {
    getAll: () => of([]),
    getImageUrl: (filename: string) => `http://localhost:8080/api/products/images/${filename}`
  };

  const mockCartService = {
    getCart: () => of({ items: [] }),
    getCartCount: () => of(0),
    addToCart: () => of({ items: [] }),
    updateCartItem: () => of({ items: [] })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarketplacePatientComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: CartService, useValue: mockCartService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MarketplacePatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeDefined();
  });
});