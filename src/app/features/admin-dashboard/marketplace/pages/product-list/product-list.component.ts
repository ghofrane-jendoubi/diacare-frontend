import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ProductService } from '../../../../../services/serv-market/product.service';
import { Product } from '../../../../../models/product';

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

  constructor(
    public productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
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

  if (!this.selectedProduct.name || this.selectedProduct.name.length < 3) {
    this.errorMessage = "Nom invalide";
    return;
  }

  if (!this.selectedProduct.price || this.selectedProduct.price <= 0) {
    this.errorMessage = "Prix invalide";
    return;
  }

  if (!this.selectedProduct.type) {
    this.errorMessage = "Type obligatoire";
    return;
  }

  const formData = new FormData();
  formData.append('name', this.selectedProduct.name);
  formData.append('price', this.selectedProduct.price.toString());
  formData.append('type', this.selectedProduct.type);

  if (this.selectedFile) formData.append('image', this.selectedFile);
  if (this.selectedProduct.barcode) formData.append('barcode', this.selectedProduct.barcode);
  if (this.selectedProduct.stock) formData.append('stock', this.selectedProduct.stock.toString());
  if (this.selectedProduct.sugarLevel) formData.append('sugarLevel', this.selectedProduct.sugarLevel.toString());
  if (this.selectedProduct.description) formData.append('description', this.selectedProduct.description);

  this.productService.updateWithImage(this.selectedProduct.id!, formData).subscribe({
    next: () => {
      this.closeEditModal();
      this.loadProducts();
    },
    error: () => {
      this.errorMessage = "Échec de mise à jour";
    }
  });
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
}