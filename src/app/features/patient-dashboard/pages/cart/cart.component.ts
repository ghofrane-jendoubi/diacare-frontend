import { Component, OnInit } from '@angular/core';
import { Cart } from '../../../../models/cart';
import { CartService } from '../../../../services/serv-market/cart.service';
import { Cartitem } from '../../../../models/cartitem';
import { OrderService } from '../../../../services/serv-market/order.service';
import { Router } from '@angular/router'; 
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  error = '';
  patientId: number | null = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPatientId();
    this.loadCart();
  }

  private loadPatientId(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this.patientId = user.id;
    } else {
      const patientId = localStorage.getItem('patient_id') || 
                        localStorage.getItem('userId') ||
                        localStorage.getItem('user_id');
      if (patientId) {
        this.patientId = parseInt(patientId);
      }
    }
    
    if (!this.patientId) {
      console.error('Patient ID non trouvé');
      this.error = 'Veuillez vous reconnecter';
    }
  }

  loadCart(): void {
    if (!this.patientId) {
      this.error = 'Patient non identifié';
      this.loading = false;
      return;
    }
    
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (data) => {
        this.cart = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load cart', err);
        this.error = 'Unable to load cart. Please try again later.';
        this.loading = false;
      }
    });
  }

  updateQuantity(item: Cartitem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(item);
      return;
    }
    const oldQuantity = item.quantity;
    item.quantity = newQuantity;

    this.cartService.updateCartItem(item.id, newQuantity).subscribe({
      next: (updatedCart) => {
        this.cart = updatedCart;
      },
      error: (err) => {
        console.error('Update failed', err);
        item.quantity = oldQuantity;
        this.error = 'Failed to update quantity.';
      }
    });
  }

  removeItem(item: Cartitem): void {
    this.cartService.removeCartItem(item.id).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  getTotal(): number {
    return this.cart?.totalPrice ?? 0;
  }

  getImageUrl(filename: string): string {
    return 'http://localhost:8080/api/products/images/' + filename;
  }

  checkout(): void {
    if (!this.cart || this.cart.items.length === 0) {
      this.error = 'Votre panier est vide ❌';
      return;
    }

    if (!this.patientId) {
      this.error = 'Patient non identifié ❌';
      return;
    }

    this.orderService.checkout(this.patientId).subscribe({
      next: () => {
        alert('✅ Commande validée !');
        this.loadCart();
        this.router.navigate(['/patient/orders']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors de la commande ❌';
      }
    });
  }

  viewProductDetails(productId: number): void {
    this.router.navigate(['/patient/product', productId]);
  }
}