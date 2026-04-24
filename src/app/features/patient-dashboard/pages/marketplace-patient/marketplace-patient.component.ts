import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../../services/serv-market/product.service';
import { Product } from '../../../../models/product';
import { CartService } from '../../../../services/serv-market/cart.service';
import { Cart } from '../../../../models/cart';
import { HttpClient } from '@angular/common/http';
import { YouTubeService } from '../../../../services/serv-market/youtube.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-marketplace-patient',
  templateUrl: './marketplace-patient.component.html',
  styleUrls: ['./marketplace-patient.component.css']
})
export class MarketplacePatientComponent implements OnInit {
  // Products properties
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = false;
  error = '';
  searchTerm = '';
  selectedType: string = 'all';
  imageErrorMap: { [id: number]: boolean } = {};

  // Cart properties
  cartCount = 0;
  productQuantities: { [id: number]: number } = {};

  // Analyzer properties
  showAnalyzerModal = false;
  analyzerMode: 'image' | 'name' | 'barcode' = 'barcode';
  selectedFile: File | null = null;
  productName = '';
  barcode = '';
  analysisResult: any = null;
  isAnalyzing = false;
  analyzerError = '';

  // Details Modal properties
  showDetailsModal = false;
  selectedProductForDetails: any = null;
  productVideos: any[] = [];
  isLoadingVideos = false;

  constructor(
    public productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private http: HttpClient,
    private youTubeService: YouTubeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCart();
    const user = this.authService.getCurrentUser();
    if (!user) {
      console.error('Utilisateur non connecté');
      this.router.navigate(['/login']);
      return;
    }
    
    console.log('Utilisateur connecté:', user);
    console.log('ID Patient:', user.id);
    
    this.loadProducts();
    this.loadCart();
  
  }

  // ==================== PRODUCT METHODS ====================

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

  onImageError(product: Product): void {
    if (product.id) {
      this.imageErrorMap[product.id] = true;
    }
  }

  getSeller(product: Product): string {
    return (product as any).seller || 'Vendeur officiel';
  }

  // ==================== CART METHODS ====================

  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (cart: Cart) => {
        this.updateCartCount(cart);
        this.productQuantities = {};
        cart.items.forEach(item => {
          this.productQuantities[item.product.id] = item.quantity;
        });
      },
      error: (err) => console.error(err)
    });
  }

  private updateCartCount(cart: Cart): void {
    this.cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  incrementAndUpdate(product: Product): void {
    this.cartService.addToCart(product.id!, 1).subscribe({
      next: (cart: Cart) => {
        this.productQuantities[product.id!] = (this.productQuantities[product.id!] || 0) + 1;
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

      this.cartService.updateCartItem(item.id, newQty).subscribe(updated => {
        this.productQuantities[product.id!] = newQty;
        this.updateCartCount(updated);
      });
    });
  }

  buyProduct(product: Product): void {
    this.incrementAndUpdate(product);
  }

  goToCart(): void {
    this.router.navigate(['/patient/cart']);
  }

  // ==================== DETAILS MODAL METHODS ====================

  // Ajoute ces méthodes
openDetailsModal(product: any): void {
  this.selectedProductForDetails = product;
  this.showDetailsModal = true;
  this.productVideos = [];
  this.isLoadingVideos = true;
  
  // Empêche le défilement du body
  document.body.classList.add('modal-open');
  
  // Appel API pour les vidéos...
  this.youTubeService.getProductVideos(product.id).subscribe({
    next: (response: any) => {
      this.productVideos = response.videos || [];
      this.isLoadingVideos = false;
    },
    error: (error) => {
      console.error('Error loading videos:', error);
      this.isLoadingVideos = false;
    }
  });
}

closeDetailsModal(): void {
  this.showDetailsModal = false;
  this.selectedProductForDetails = null;
  this.productVideos = [];
  
  // Réactive le défilement du body
  document.body.classList.remove('modal-open');
}

  playVideo(videoId: string): void {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  }

  // ==================== ANALYZER METHODS ====================

  openAnalyzerModal(): void {
    this.showAnalyzerModal = true;
    this.resetAnalyzer();
  }

  closeAnalyzerModal(): void {
    this.showAnalyzerModal = false;
    this.resetAnalyzer();
  }

  resetAnalyzer(): void {
    this.analyzerMode = 'barcode';
    this.selectedFile = null;
    this.productName = '';
    this.barcode = '';
    this.analysisResult = null;
    this.analyzerError = '';
    this.isAnalyzing = false;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.analyzerError = '';
  }

  analyzeProduct(): void {
    this.isAnalyzing = true;
    this.analyzerError = '';
    this.analysisResult = null;

    if (this.analyzerMode === 'barcode') {
      if (!this.barcode.trim()) {
        this.analyzerError = 'Veuillez entrer un code-barres';
        this.isAnalyzing = false;
        return;
      }
      
      this.http.get(`http://localhost:8081/api/ml/analyze-barcode/${this.barcode}`)
        .subscribe({
          next: (result: any) => {
            this.processAnalysisResult(result);
            this.isAnalyzing = false;
          },
          error: (err: any) => {
            console.error('Analysis error:', err);
            this.analyzerError = err.error?.error || 'Erreur lors de l\'analyse du produit';
            this.isAnalyzing = false;
          }
        });
    } 
    else if (this.analyzerMode === 'name') {
      if (!this.productName.trim()) {
        this.analyzerError = 'Veuillez entrer un nom de produit';
        this.isAnalyzing = false;
        return;
      }
      
      this.http.post('http://localhost:8081/api/ml/analyze-name', { productName: this.productName })
        .subscribe({
          next: (result: any) => {
            this.processAnalysisResult(result);
            this.isAnalyzing = false;
          },
          error: (err: any) => {
            console.error('Analysis error:', err);
            this.analyzerError = err.error?.error || 'Erreur lors de l\'analyse du produit';
            this.isAnalyzing = false;
          }
        });
    }
    else if (this.analyzerMode === 'image') {
      if (!this.selectedFile) {
        this.analyzerError = 'Veuillez sélectionner une photo';
        this.isAnalyzing = false;
        return;
      }
      
      const formData = new FormData();
      formData.append('image', this.selectedFile);
      
      this.http.post('http://localhost:8081/api/ml/analyze-image', formData)
        .subscribe({
          next: (result: any) => {
            this.processAnalysisResult(result);
            this.isAnalyzing = false;
          },
          error: (err: any) => {
            console.error('Analysis error:', err);
            this.analyzerError = err.error?.error || 'Erreur lors de l\'analyse de la photo';
            this.isAnalyzing = false;
          }
        });
    }
  }

  private processAnalysisResult(result: any): void {
    if (!result.recommendation) {
      result.recommendation = {};
    }
    
    if (result.recommendation?.is_recommended === undefined && result.nutrition?.sugars_100g !== undefined) {
      const sugars = result.nutrition.sugars_100g;
      result.recommendation.is_recommended = sugars < 15;
      result.recommendation.prediction = sugars < 15 ? 1 : 0;
      result.recommendation.message = sugars < 15 
        ? "✅ Produit recommandé pour diabétique" 
        : "❌ Produit non recommandé pour diabétique";
      result.recommendation.confidence = 0.85;
    }
    
    this.analysisResult = result;
  }

  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.4) return 'medium';
    return 'low';
  }
}