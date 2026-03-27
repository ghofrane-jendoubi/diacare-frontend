import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ProductService } from '../../../../../services/serv-market/product.service';
import { Product } from '../../../../../models/product';

@Component({
  selector: 'app-product-add',
  templateUrl: './product-add.component.html',
  styleUrls: ['./product-add.component.css']
})
export class ProductAddComponent {
  product: Product = {
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
  submitted = false;
  isLoading = false;
  imageUploadMode: 'url' | 'file' = 'url';

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  // Handle file selection for image upload
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // Clear URL if file is selected
      this.product.image = '';
    }
  }

  // Handle image URL change
  onImageUrlChange(url: string): void {
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      this.imagePreview = url;
      this.selectedFile = null;
    } else if (!url) {
      this.imagePreview = null;
    }
  }

  // Clear selected image
  clearImage(): void {
    this.selectedFile = null;
    this.product.image = '';
    this.imagePreview = null;
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  // Save product - handles both URL and file upload
  save(): void {
    this.submitted = true;
    this.isLoading = true;

    // Validate required fields
    if (!this.product.name || !this.product.price || !this.product.type) {
      this.isLoading = false;
      this.showNotification('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    // If file is selected, use upload endpoint
    if (this.selectedFile) {
      this.saveWithImage();
    } else {
      // Otherwise use regular add endpoint with URL or no image
      this.saveWithoutImage();
    }
  }

  // Save product with image file upload
  private saveWithImage(): void {
    const formData = new FormData();
    formData.append('name', this.product.name);
    formData.append('price', this.product.price.toString());
    formData.append('type', this.product.type);
    formData.append('image', this.selectedFile!);
    
    // Optional fields
    if (this.product.barcode) formData.append('barcode', this.product.barcode);
    if (this.product.stock) formData.append('stock', this.product.stock.toString());
    if (this.product.sugarLevel) formData.append('sugarLevel', this.product.sugarLevel.toString());
    if (this.product.description) formData.append('description', this.product.description);

    this.productService.addWithImage(formData).subscribe({
      next: (response: Product) => {
        this.isLoading = false;
        this.showNotification('✅ Produit ajouté avec succès', 'success');
        setTimeout(() => {
          this.router.navigate(['/admin/marketplace']);
        }, 1500);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Upload error:', err);
        this.handleError(err);
      }
    });
  }

  // Save product without image (or with URL image)
  private saveWithoutImage(): void {
    const productData: Product = {
      name: this.product.name,
      barcode: this.product.barcode,
      price: this.product.price,
      stock: this.product.stock,
      sugarLevel: this.product.sugarLevel,
      type: this.product.type,
      description: this.product.description,
      image: this.product.image || ''
    };

    this.productService.add(productData).subscribe({
      next: (response: Product) => {
        this.isLoading = false;
        this.showNotification('✅ Produit ajouté avec succès', 'success');
        setTimeout(() => {
          this.router.navigate(['/admin/marketplace']);
        }, 1500);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Add error:', err);
        this.handleError(err);
      }
    });
  }

  // Handle errors
  private handleError(err: any): void {
    let errorMessage = '❌ Erreur lors de l\'ajout du produit';
    
    if (err.status === 0) {
      errorMessage = '❌ Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur le port 8080';
    } else if (err.status === 400) {
      errorMessage = '❌ Données invalides. Vérifiez les champs';
    } else if (err.status === 500) {
      errorMessage = '❌ Erreur serveur. Vérifiez les logs du backend';
    } else if (err.error && typeof err.error === 'string') {
      errorMessage = `❌ ${err.error}`;
    }
    
    this.showNotification(errorMessage, 'error');
  }

  // Show notification
  private showNotification(message: string, type: 'success' | 'error'): void {
    const notification = document.createElement('div');
    notification.className = `toast-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Reset form
  resetForm(form: NgForm): void {
    this.product = {
      name: '',
      barcode: '',
      price: 0,
      stock: 0,
      sugarLevel: 0,
      type: '',
      description: '',
      image: ''
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.submitted = false;
    this.imageUploadMode = 'url';
    
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    
    if (form) form.resetForm();
  }
}