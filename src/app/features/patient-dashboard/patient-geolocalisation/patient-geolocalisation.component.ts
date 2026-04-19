import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { Place } from '../../../models/place.model';
import { GeolocalisationService } from '../../../services/geolocalisation.service';

@Component({
  selector: 'app-patient-geolocalisation',
  templateUrl: './patient-geolocalisation.component.html',
  styleUrls: ['./patient-geolocalisation.component.css']
})
export class PatientGeolocalisationComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  private markerClusterGroup!: L.MarkerClusterGroup;

  loading = false;
  errorMessage = '';

  userLat: number | null = null;
  userLng: number | null = null;

  radiusMeters = 3000;
  radiusOptions = [1000, 3000, 5000, 10000];

  selectedFilter: 'all' | 'medecin' | 'pharmacie' | 'nutritionniste' | 'laboratoire' = 'all';
  searchTerm = '';
  openNowOnly = false;
  favoritesOnly = false;

  addressQuery = '';
  addressResults: { lat: number; lng: number; label: string }[] = [];

  places: Place[] = [];
  filteredPlaces: Place[] = [];
  selectedPlace: Place | null = null;
  favoriteIds: string[] = [];
  searchCircle: L.Circle | null = null;

  // NOUVEAU
  urgentMode = false;
  bestChoice: Place | null = null;
  recommendedPlaces: Place[] = [];

  constructor(private geoService: GeolocalisationService) {}

  ngOnInit(): void {
    this.favoriteIds = this.loadFavorites();
  }

  ngAfterViewInit(): void {
    this.fixLeafletIcons();
    this.initMap();
    this.getCurrentLocation();
  }

  private fixLeafletIcons(): void {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });
  }

  private initMap(): void {
    this.map = L.map('patient-map').setView([36.8065, 10.1815], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markerClusterGroup = L.markerClusterGroup();
    this.map.addLayer(this.markerClusterGroup);
  }

  getCurrentLocation(): void {
    this.loading = true;
    this.errorMessage = '';

    if (!navigator.geolocation) {
      this.loading = false;
      this.errorMessage = 'La géolocalisation n’est pas supportée par votre navigateur.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userLat = position.coords.latitude;
        this.userLng = position.coords.longitude;
        this.map.setView([this.userLat, this.userLng], 14);
        this.loadNearbyPlaces();
      },
      () => {
        this.loading = false;
        this.errorMessage = 'Impossible de récupérer votre position.';
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  loadNearbyPlaces(): void {
    if (this.userLat == null || this.userLng == null) return;

    this.loading = true;
    this.geoService.getNearbyPlaces(this.userLat, this.userLng, this.radiusMeters).subscribe({
      next: (places: Place[]) => {
        this.places = places;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les lieux autour de vous.';
        this.loading = false;
      }
    });
  }

  onRadiusChange(): void {
    if (this.userLat != null && this.userLng != null) {
      this.drawSearchCircle(this.userLat, this.userLng);
      this.loadNearbyPlaces();
    }
  }

  searchAddress(): void {
    if (!this.addressQuery.trim()) {
      this.addressResults = [];
      return;
    }

    this.geoService.searchAddress(this.addressQuery).subscribe({
      next: (results) => {
        this.addressResults = results;
      },
      error: () => {
        this.errorMessage = 'Impossible de rechercher cette adresse.';
      }
    });
  }

  chooseAddress(result: { lat: number; lng: number; label: string }): void {
    this.userLat = result.lat;
    this.userLng = result.lng;
    this.addressQuery = result.label;
    this.addressResults = [];
    this.map.setView([this.userLat, this.userLng], 14);
    this.loadNearbyPlaces();
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    let base = this.places.filter((place: Place) => {
      const typeOk = this.selectedFilter === 'all' || place.type === this.selectedFilter;
      const textOk =
        !term ||
        place.name.toLowerCase().includes(term) ||
        place.address.toLowerCase().includes(term);

      const openOk = !this.openNowOnly || place.openNow === true;
      const favOk = !this.favoritesOnly || this.favoriteIds.includes(place.id);

      return typeOk && textOk && openOk && favOk;
    });

    if (this.urgentMode) {
      base = this.sortPlacesForUrgency(base);
    }

    this.filteredPlaces = base;
    this.computeBestChoice();
    this.renderMarkers();
  }

  renderMarkers(): void {
    this.markerClusterGroup.clearLayers();

    if (this.userLat != null && this.userLng != null) {
      const userMarker = L.marker([this.userLat, this.userLng]).bindPopup('Votre position');
      this.markerClusterGroup.addLayer(userMarker);
      this.drawSearchCircle(this.userLat, this.userLng);
    }

    this.filteredPlaces.forEach((place: Place) => {
      const marker = L.marker([place.lat, place.lng]).bindPopup(`
        <strong>${place.name}</strong><br>
        ${this.getTypeLabel(place.type)}<br>
        ${place.address}<br>
        Distance: ${this.getDistance(place)}<br>
        Score: ${this.computePlaceScore(place)}
      `);

      marker.on('click', () => {
        this.selectedPlace = place;
      });

      this.markerClusterGroup.addLayer(marker);
    });
  }

  drawSearchCircle(lat: number, lng: number): void {
    if (this.searchCircle) {
      this.map.removeLayer(this.searchCircle);
    }

    this.searchCircle = L.circle([lat, lng], {
      radius: this.radiusMeters,
      color: '#4f46e5',
      fillColor: '#818cf8',
      fillOpacity: 0.12
    }).addTo(this.map);
  }

  selectPlace(place: Place): void {
    this.selectedPlace = place;
    this.map.setView([place.lat, place.lng], 16);
  }

  toggleFavorite(place: Place): void {
    if (this.favoriteIds.includes(place.id)) {
      this.favoriteIds = this.favoriteIds.filter(id => id !== place.id);
    } else {
      this.favoriteIds.push(place.id);
    }

    localStorage.setItem('patient_geo_favorites', JSON.stringify(this.favoriteIds));
    this.applyFilters();
  }

  isFavorite(place: Place): boolean {
    return this.favoriteIds.includes(place.id);
  }

  openDirections(place: Place): void {
    if (this.userLat == null || this.userLng == null) return;
    const url = `https://www.google.com/maps/dir/${this.userLat},${this.userLng}/${place.lat},${place.lng}`;
    window.open(url, '_blank');
  }

  getDistance(place: Place): string {
    if (place.distanceKm == null) return '? km';
    return `${place.distanceKm.toFixed(1)} km`;
  }

  refreshAroundMe(): void {
    this.getCurrentLocation();
  }

  // ---------------------------
  // MODE URGENCE
  // ---------------------------
  toggleUrgentMode(): void {
    this.urgentMode = !this.urgentMode;

    if (this.urgentMode) {
      this.selectedFilter = 'all';
      this.openNowOnly = true;
    }

    this.applyFilters();
  }

  private sortPlacesForUrgency(places: Place[]): Place[] {
    return [...places].sort((a, b) => this.computeUrgencyScore(b) - this.computeUrgencyScore(a));
  }

  private computeUrgencyScore(place: Place): number {
    let score = 0;

    // Priorité métier urgence
    if (place.type === 'pharmacie') score += 50;
    if (place.type === 'medecin') score += 40;
    if (place.type === 'laboratoire') score += 25;
    if (place.type === 'nutritionniste') score += 15;

    // Ouvert maintenant
    if (place.openNow === true) score += 30;

    // Plus proche = meilleur
    if (place.distanceKm != null) {
      score += Math.max(0, 30 - place.distanceKm * 5);
    }

    return Math.round(score);
  }

  // ---------------------------
  // MEILLEUR CHOIX
  // ---------------------------
  computeBestChoice(): void {
    if (this.filteredPlaces.length === 0) {
      this.bestChoice = null;
      this.recommendedPlaces = [];
      return;
    }

    const scored = [...this.filteredPlaces]
      .map((place) => ({
        place,
        score: this.computePlaceScore(place)
      }))
      .sort((a, b) => b.score - a.score);

    this.bestChoice = scored[0].place;
    this.recommendedPlaces = scored.slice(0, 3).map(item => item.place);
  }

  computePlaceScore(place: Place): number {
    let score = 0;

    // disponibilité
    if (place.openNow === true) score += 35;

    // distance
    if (place.distanceKm != null) {
      score += Math.max(0, 40 - place.distanceKm * 6);
    }

    // priorités métier patient
    if (place.type === 'pharmacie') score += 25;
    if (place.type === 'medecin') score += 22;
    if (place.type === 'laboratoire') score += 12;
    if (place.type === 'nutritionniste') score += 10;

    // favori
    if (this.favoriteIds.includes(place.id)) score += 8;

    // bonus si urgence active
    if (this.urgentMode) {
      score += this.computeUrgencyScore(place) * 0.5;
    }

    return Math.round(score);
  }

  selectBestChoice(): void {
    if (!this.bestChoice) return;
    this.selectPlace(this.bestChoice);
  }

  getTypeLabel(type: Place['type']): string {
    switch (type) {
      case 'medecin': return 'Médecin';
      case 'pharmacie': return 'Pharmacie';
      case 'nutritionniste': return 'Nutritionniste';
      case 'laboratoire': return 'Laboratoire';
      case 'patient': return 'Patient';
      default: return 'Lieu';
    }
  }

  private loadFavorites(): string[] {
    const raw = localStorage.getItem('patient_geo_favorites');
    return raw ? JSON.parse(raw) : [];
  }
}