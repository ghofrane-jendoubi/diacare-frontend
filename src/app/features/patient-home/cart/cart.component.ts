import { Component, OnInit } from '@angular/core';
import { Cart } from '../../../models/cart';
import { CartService } from '../../../services/serv-market/cart.service';
import { Cartitem } from '../../../models/cartitem';
import { OrderService } from '../../../services/serv-market/order.service';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  error = '';

  constructor(private cartService: CartService,private orderService: OrderService,private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
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
    // Optimistically update UI, then call service
    const oldQuantity = item.quantity;
    item.quantity = newQuantity;

    this.cartService.updateCartItem(item.id, newQuantity).subscribe({
      next: (updatedCart) => {
        this.cart = updatedCart;
      },
      error: (err) => {
        console.error('Update failed', err);
        item.quantity = oldQuantity; // revert
        this.error = 'Failed to update quantity.';
      }
    });
  }

 removeItem(item: Cartitem): void {
  this.cartService.removeCartItem(item.id).subscribe({
    next: () => {
      this.loadCart(); // 🔥 reload from backend
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

  this.orderService.checkout().subscribe({
    next: () => {
      alert('✅ Commande validée !');

      this.loadCart();

      // 🔥 redirect
      this.router.navigate(['/patient/orders']);
    },
    error: (err) => {
      console.error(err);
      this.error = 'Erreur lors de la commande ❌';
    }
  });
}
}