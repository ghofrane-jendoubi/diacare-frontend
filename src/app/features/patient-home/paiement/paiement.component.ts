import { Component, OnInit } from '@angular/core';
import { CartService } from '../../../services/serv-market/cart.service';
import { OrderService } from '../../../services/serv-market/order.service';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
@Component({
  selector: 'app-paiement',
  templateUrl: './paiement.component.html',
  styleUrls: ['./paiement.component.css']
})
export class PaiementComponent implements OnInit {

  cart: any = { items: [] };
  total = 0;

  // form paiement
  nom = '';
  numero = '';
  date = '';
  cvc = '';

  loading = false;
  success = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.loadCart();
  }

 loadCart() {
  this.cartService.getCart().subscribe({
    next: (data) => {
      this.cart = data || { items: [] };

      // 🔥 CALCUL TOTAL
      this.total = this.cart.items.reduce(
        (sum: number, item: any) =>
          sum + item.product.price * item.quantity,
        0
      );
    },
    error: () => {
      this.cart = { items: [] };
      this.total = 0;
    }
  });
}

  // 🔥 paiement
  payer() {
    if (!this.nom || !this.numero || !this.date || !this.cvc) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.loading = true;

    this.orderService.checkout().subscribe({
      next: (order: any) => {
        this.success = true;
        this.loading = false;

        // 🎉 CONFETTI
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 }
        });

        // 🧾 PDF
        this.generatePDF(order);
      },
      error: () => {
        this.loading = false;
        alert('Erreur paiement');
      }
    });
  }

  // 🧾 FACTURE PDF
  generatePDF(order: any) {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Facture Diacare', 20, 20);

    doc.setFontSize(12);
    doc.text('Client: Rim Khalfaoui', 20, 30);
    doc.text('Date: ' + new Date().toLocaleDateString(), 20, 40);

    let y = 60;

    order.items.forEach((item: any) => {
      doc.text(
        `${item.product.name} x${item.quantity} = ${item.price * item.quantity} DT`,
        20,
        y
      );
      y += 10;
    });

    doc.text('Total: ' + order.totalPrice + ' DT', 20, y + 10);

    doc.save('facture.pdf');
  }
}