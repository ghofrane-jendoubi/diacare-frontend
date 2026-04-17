import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { Place } from '../../../models/place.model';
import { GeolocalisationService } from '../../../services/geolocalisation.service';

@Component({
  selector: 'app-nutritionnist-geolocalisation',
  templateUrl: './nutritionnist-geolocalisation.component.html',
  styleUrls: ['./nutritionnist-geolocalisation.component.css']
})
export class NutritionnistGeolocalisationComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  private markerClusterGroup!: L.MarkerClusterGroup;

  loading = false;
  errorMessage = '';

  userLat: number | null = null;
  userLng: number | null = null;

  radiusMeters = 3000;
  radiusOptions = [1000, 3000, 5000, 10000];

  selectedFilter: 'all' | 'pharmacie' | 'laboratoire' | 'nutritionniste' = 'all';
  searchTerm = '';
  favoritesOnly = false;

  addressQuery = '';
  addressResults: { lat: number; lng: number; label: string }[] = [];

  places: Place[] = [];
  filteredPlaces: Place[] = [];
  selectedPlace: Place | null = null;
  favoriteIds: string[] = [];
  searchCircle: L.Circle | null = null;

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
    this.map = L.map('nutritionnist-map').setView([36.8065, 10.1815], 13);

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
      this.errorMessage = 'La géolocalisation n’est pas supportée.';
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
        this.places = places.filter(
          (place: Place) =>
            place.type === 'pharmacie' ||
            place.type === 'laboratoire' ||
            place.type === 'nutritionniste'
        );
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

    this.filteredPlaces = this.places.filter((place: Place) => {
      const typeOk = this.selectedFilter === 'all' || place.type === this.selectedFilter;
      const textOk =
        !term ||
        place.name.toLowerCase().includes(term) ||
        place.address.toLowerCase().includes(term);

      const favOk = !this.favoritesOnly || this.favoriteIds.includes(place.id);
      return typeOk && textOk && favOk;
    });

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
        Distance: ${this.getDistance(place)}
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
      color: '#16a34a',
      fillColor: '#86efac',
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

    localStorage.setItem('nutritionnist_geo_favorites', JSON.stringify(this.favoriteIds));
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

  getTypeLabel(type: Place['type']): string {
    switch (type) {
      case 'nutritionniste': return 'Nutritionniste';
      case 'pharmacie': return 'Pharmacie';
      case 'laboratoire': return 'Laboratoire';
      case 'medecin': return 'Médecin';
      case 'patient': return 'Patient';
      default: return 'Lieu';
    }
  }

  private loadFavorites(): string[] {
    const raw = localStorage.getItem('nutritionnist_geo_favorites');
    return raw ? JSON.parse(raw) : [];
  }
}