import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/serv-market/product.service';
import { Product } from '../../../models/product';

@Component({
  selector: 'app-marketplace-patient',
  templateUrl: './marketplace-patient.component.html',
  styleUrls: ['./marketplace-patient.component.css']
})
export class MarketplacePatientComponent implements OnInit {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = false;
  error = '';
  searchTerm = '';
  selectedType: string = 'all';
  cartCount = 0;

  // For quantity selector
  productQuantities: { [id: number]: number } = {};

  // For image error handling
  imageErrorMap: { [id: number]: boolean } = {};

  constructor(public productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAll().subscribe({
      next: (data: Product[]) => {
        // Add dummy seller; use type assertion to avoid type error
        this.allProducts = data.map(p => ({ ...p, seller: 'Rim Khalfaoui' } as Product));
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'Erreur de chargement des produits.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let temp = [...this.allProducts];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter(p => p.name.toLowerCase().includes(term));
    }
    if (this.selectedType !== 'all') {
      temp = temp.filter(p => p.type === this.selectedType);
    }
    this.filteredProducts = temp;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onTypeChange(): void {
    this.applyFilters();
  }

  getImageUrl(filename: string): string {
    return this.productService.getImageUrl(filename);
  }

  goToCart(): void {
    console.log('Open cart');
  }

  getSeller(product: Product): string {
    // Use type assertion to access seller (if present)
    return (product as any).seller || 'Vendeur officiel';
  }

  // Quantity selector methods
  toggleQuantity(product: Product): void {
    if (!this.productQuantities[product.id!]) {
      this.productQuantities[product.id!] = 1;
    }
    // If already showing, do nothing (could also hide, but we'll keep)
  }

  incrementQuantity(product: Product): void {
    const current = this.productQuantities[product.id!] || 0;
    this.productQuantities[product.id!] = current + 1;
  }

  decrementQuantity(product: Product): void {
    const current = this.productQuantities[product.id!] || 0;
    if (current > 1) {
      this.productQuantities[product.id!] = current - 1;
    } else {
      delete this.productQuantities[product.id!];
    }
  }

  addToCart(product: Product): void {
    const quantity = this.productQuantities[product.id!];
    if (quantity && quantity > 0) {
      console.log(`Adding ${quantity} x ${product.name} to cart`);
      alert(`${quantity} x ${product.name} ajouté au panier !`);
      delete this.productQuantities[product.id!];
      this.cartCount += quantity;
    }
  }

  onImageError(product: Product): void {
    if (product.id) {
      this.imageErrorMap[product.id] = true;
    }
  }
}