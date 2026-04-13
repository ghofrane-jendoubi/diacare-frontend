import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ProductService } from '../../../../../services/serv-market/product.service';
import { Product } from '../../../../../models/product';
import { ChartConfiguration } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  // Table data
  products: Product[] = [];
  isLoading = false;
  errorMessage = '';
  imageErrorMap: { [key: number]: boolean } = {};

  // Add modal state
  showAddModal = false;
  addSubmitted = false;
  addError = '';
  addSuccess = '';
  newProduct: Product = {
    name: '',
    barcode: '',
    price: 0,
    stock: 0,
    sugarLevel: 0,
    type: '',
    description: '',
    image: ''
  };
  newFile: File | null = null;
  newImagePreview: string | null = null;

  // Edit modal state
  showEditModal = false;
  selectedProduct: Product = {
    id: 0,
    name: '',
    barcode: '',
    price: 0,
    stock: 0,
    sugarLevel: 0,
    type: '',
    description: '',
    image: ''
  };
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  totalProducts = 0;
alimentaireCount = 0;
medicalCount = 0;
lowStockCount = 0;
totalStock = 0;
isBrowser = false;
  constructor(
    public productService: ProductService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true;
    }}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
  this.isLoading = true;
  this.productService.getAll().subscribe({
    next: (data) => {
      this.products = data;
      this.isLoading = false;
      this.calculateStats(); // ← ADD THIS LINE
    },
    error: (err) => {
      console.error('Error loading products:', err);
      this.errorMessage = 'Failed to load products. Please try again.';
      this.isLoading = false;
    }
  });
}

  // -------------------- Delete --------------------
  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.delete(id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== id);
          delete this.imageErrorMap[id];
          this.showNotification('Product deleted successfully', 'success');
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.showNotification('Failed to delete product', 'error');
        }
      });
    }
  }

  // -------------------- Add Modal --------------------
  openAddModal(): void {
    this.showAddModal = true;
    this.addSubmitted = false;
    this.addError = '';
    this.addSuccess = '';
    this.newProduct = {
      name: '',
      barcode: '',
      price: 0,
      stock: 0,
      sugarLevel: 0,
      type: '',
      description: '',
      image: ''
    };
    this.newFile = null;
    this.newImagePreview = null;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  onNewFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.newFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.newImagePreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  saveNewProduct(form: NgForm): void {

  this.addSubmitted = true;
  this.addError = '';
  this.addSuccess = '';

  // 🔥 DEBUG (optionnel)
  console.log(form.controls);

  if (form.invalid) {
    this.addError = 'Veuillez corriger les champs obligatoires';
    return;
  }

  const formData = new FormData();
  formData.append('name', this.newProduct.name);
  formData.append('price', this.newProduct.price.toString());
  formData.append('type', this.newProduct.type);

  if (this.newFile) formData.append('image', this.newFile);
  if (this.newProduct.barcode) formData.append('barcode', this.newProduct.barcode);
  if (this.newProduct.stock) formData.append('stock', this.newProduct.stock.toString());
  if (this.newProduct.sugarLevel) formData.append('sugarLevel', this.newProduct.sugarLevel.toString());
  if (this.newProduct.description) formData.append('description', this.newProduct.description);

  this.productService.addWithImage(formData).subscribe({
    next: () => {
      this.addSuccess = 'Produit ajouté avec succès ✔';
      this.loadProducts();
      setTimeout(() => this.closeAddModal(), 1200);
    },
    error: () => {
      this.addError = 'Erreur lors de l’ajout du produit';
    }
  });
}

  // -------------------- Edit Modal --------------------
  openEditModal(product: Product): void {
    this.selectedProduct = { ...product };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  clearImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.selectedProduct.image = '';
    const fileInput = document.getElementById('editImageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

 updateProduct(): void {
    if (!this.selectedProduct.name || !this.selectedProduct.type || this.selectedProduct.price <= 0) {
        alert('Veuillez remplir correctement tous les champs obligatoires.');
        return;
    }

    if (this.selectedFile) {
        // With image - use upload endpoint
        const formData = new FormData();
        formData.append('name', this.selectedProduct.name);
        formData.append('price', this.selectedProduct.price.toString());
        formData.append('type', this.selectedProduct.type);
        if (this.selectedProduct.barcode) formData.append('barcode', this.selectedProduct.barcode);
        if (this.selectedProduct.stock != null) formData.append('stock', this.selectedProduct.stock.toString());
        if (this.selectedProduct.sugarLevel != null) formData.append('sugarLevel', this.selectedProduct.sugarLevel.toString());
        if (this.selectedProduct.description) formData.append('description', this.selectedProduct.description);
        formData.append('image', this.selectedFile);

        this.productService.updateWithImage(this.selectedProduct.id!, formData).subscribe({
            next: (updatedProduct) => {
                const index = this.products.findIndex(p => p.id === updatedProduct.id);
                if (index > -1) this.products[index] = updatedProduct;
                this.closeEditModal();
                this.calculateStats();
                this.showNotification('Produit mis à jour avec succès ✔', 'success');
            },
            error: (err) => {
                console.error('Erreur mise à jour produit:', err);
                this.showNotification('Erreur lors de la mise à jour', 'error');
            }
        });
    } else {
        // Without image - use simple PUT
        this.productService.update(this.selectedProduct.id!, this.selectedProduct).subscribe({
            next: (updatedProduct) => {
                const index = this.products.findIndex(p => p.id === updatedProduct.id);
                if (index > -1) this.products[index] = updatedProduct;
                this.closeEditModal();
                this.calculateStats();
                this.showNotification('Produit mis à jour avec succès ✔', 'success');
            },
            error: (err) => {
                console.error('Erreur mise à jour produit:', err);
                this.showNotification('Erreur lors de la mise à jour', 'error');
            }
        });
    }
}
  // -------------------- Helpers --------------------
  getImageUrl(filename: string): string {
    return this.productService.getImageUrl(filename);
  }

  onImageError(product: Product): void {
    if (product.id) {
      this.imageErrorMap[product.id] = true;
    }
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    alert(message); // Replace with a toast notification if desired
  }
  // Chart data
 public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Alimentaire', 'Médical', 'Stock bas'],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Nombre de produits',
        backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
        borderRadius: 8
      }
    ]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,    // fixes the type error
      },
      title: {
        display: true,
        text: 'Répartition des produits'
      }
    }};
calculateStats(): void {
  console.log('Products length:', this.products.length);
  console.log('First product type:', this.products[0]?.type);
  console.log('All types:', this.products.map(p => p.type));

  this.totalProducts = this.products.length;
  this.alimentaireCount = this.products.filter(p => p.type === 'ALIMENTAIRE').length;
  this.medicalCount = this.products.filter(p => p.type === 'MEDICAL').length;
  this.lowStockCount = this.products.filter(p => p.stock < 10).length;
  this.totalStock = this.products.reduce((sum, p) => sum + p.stock, 0);

  console.log('alimentaireCount:', this.alimentaireCount);
  console.log('medicalCount:', this.medicalCount);
  console.log('lowStockCount:', this.lowStockCount);
}

}