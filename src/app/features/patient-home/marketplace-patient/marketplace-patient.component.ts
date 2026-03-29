import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/serv-market/product.service';
import { Product } from '../../../models/product';
import { CartService } from '../../../services/serv-market/cart.service';
import { Cart } from '../../../models/cart';

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
  cartCount = 0;                        // ✅ will be updated from cart

  productQuantities: { [id: number]: number } = {};
  imageErrorMap: { [id: number]: boolean } = {};

  constructor(
    public productService: ProductService,
    private cartService: CartService,   // ✅ inject CartService
    private router: Router              // ✅ for navigation
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCart();                    // ✅ load cart to get count
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAll().subscribe({
      next: (data: Product[]) => {
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

  // ✅ Load cart to get initial count
loadCart(): void {
  this.cartService.getCart().subscribe({
    next: (cart: Cart) => {

      this.updateCartCount(cart);

      // 🔥 SYNC UI WITH BACKEND
      this.productQuantities = {}; 

      cart.items.forEach(item => {
        this.productQuantities[item.product.id] = item.quantity;
      });

    },
    error: (err) => console.error(err)
  });
}

  // ✅ Update cart count from cart items
  private updateCartCount(cart: Cart): void {
    this.cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
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

  // ✅ Navigate to cart page
  goToCart(): void {
    this.router.navigate(['/patient/cart']);
  }

  getSeller(product: Product): string {
    return (product as any).seller || 'Vendeur officiel';
  }

  toggleQuantity(product: Product): void {
    if (!this.productQuantities[product.id!]) {
      this.productQuantities[product.id!] = 1;
    }
  }

  incrementAndUpdate(product: Product): void {
  this.cartService.addToCart(product.id!, 1).subscribe({
    next: (cart: Cart) => {
      this.productQuantities[product.id!] =
        (this.productQuantities[product.id!] || 0) + 1;

      this.updateCartCount(cart);
    },
    error: (err) => console.error(err)
  });
}

decrementAndUpdate(product: Product): void {
  const current = this.productQuantities[product.id!] || 0;

  if (current <= 0) return;

  const newQty = current - 1;

  this.cartService.getCart().subscribe(cart => {
    const item = cart.items.find(i => i.product.id === product.id);

    if (!item) return;

    // 🔥 ALWAYS UPDATE (even if 0)
    this.cartService.updateCartItem(item.id, newQty).subscribe(updated => {
      this.productQuantities[product.id!] = newQty;
      this.updateCartCount(updated);
    });
  });
}

  // ✅ Add to cart using CartService and update cart count
  addToCart(product: Product): void {
    const quantity = this.productQuantities[product.id!];
    if (quantity && quantity > 0) {
      this.cartService.addToCart(product.id!, quantity).subscribe({
        next: (cart: Cart) => {
          this.updateCartCount(cart);
          // Optional success message
          console.log(`${quantity} x ${product.name} ajouté au panier`);
          // Clear the quantity selector for this product
          delete this.productQuantities[product.id!];
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout au panier', err);
          this.error = 'Impossible d\'ajouter au panier. Veuillez réessayer.';
        }
      });
    }
  }

  onImageError(product: Product): void {
    if (product.id) {
      this.imageErrorMap[product.id] = true;
    }
  }
}