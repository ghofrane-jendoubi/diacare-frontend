import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { Place } from '../../../models/place.model';
import { GeolocalisationService } from '../../../services/geolocalisation.service';

@Component({
  selector: 'app-admin-geolocalisation',
  templateUrl: './admin-geolocalisation.component.html',
  styleUrls: ['./admin-geolocalisation.component.css']
})
export class AdminGeolocalisationComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  private markerClusterGroup!: L.MarkerClusterGroup;

  loading = false;
  errorMessage = '';

  centerLat = 36.8065;
  centerLng = 10.1815;

  radiusMeters = 5000;
  radiusOptions = [1000, 3000, 5000, 10000];

  selectedFilter: 'all' | 'medecin' | 'pharmacie' | 'nutritionniste' | 'laboratoire' = 'all';
  searchTerm = '';

  addressQuery = '';
  addressResults: { lat: number; lng: number; label: string }[] = [];

  places: Place[] = [];
  filteredPlaces: Place[] = [];
  searchCircle: L.Circle | null = null;

  stats = {
    medecins: 0,
    pharmacies: 0,
    nutritionnistes: 0,
    laboratoires: 0
  };

  constructor(private geoService: GeolocalisationService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.fixLeafletIcons();
    this.initMap();
    this.loadNearbyPlaces();
  }

  private fixLeafletIcons(): void {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });
  }

  private initMap(): void {
    this.map = L.map('admin-map').setView([this.centerLat, this.centerLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markerClusterGroup = L.markerClusterGroup();
    this.map.addLayer(this.markerClusterGroup);
  }

  loadNearbyPlaces(): void {
    this.loading = true;
    this.errorMessage = '';

    this.geoService.getNearbyPlaces(this.centerLat, this.centerLng, this.radiusMeters).subscribe({
      next: (places: Place[]) => {
        this.places = places;
        this.computeStats();
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les lieux pour la vue admin.';
        this.loading = false;
      }
    });
  }

  onRadiusChange(): void {
    this.drawSearchCircle(this.centerLat, this.centerLng);
    this.loadNearbyPlaces();
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
    this.centerLat = result.lat;
    this.centerLng = result.lng;
    this.addressQuery = result.label;
    this.addressResults = [];
    this.map.setView([this.centerLat, this.centerLng], 13);
    this.loadNearbyPlaces();
  }

  computeStats(): void {
    this.stats.medecins = this.places.filter(p => p.type === 'medecin').length;
    this.stats.pharmacies = this.places.filter(p => p.type === 'pharmacie').length;
    this.stats.nutritionnistes = this.places.filter(p => p.type === 'nutritionniste').length;
    this.stats.laboratoires = this.places.filter(p => p.type === 'laboratoire').length;
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredPlaces = this.places.filter((place: Place) => {
      const typeOk = this.selectedFilter === 'all' || place.type === this.selectedFilter;
      const textOk =
        !term ||
        place.name.toLowerCase().includes(term) ||
        place.address.toLowerCase().includes(term);

      return typeOk && textOk;
    });

    this.renderMarkers();
  }

  renderMarkers(): void {
    this.markerClusterGroup.clearLayers();

    this.drawSearchCircle(this.centerLat, this.centerLng);

    this.filteredPlaces.forEach((place: Place) => {
      const marker = L.marker([place.lat, place.lng]).bindPopup(`
        <strong>${place.name}</strong><br>
        ${this.getTypeLabel(place.type)}<br>
        ${place.address}
      `);

      this.markerClusterGroup.addLayer(marker);
    });
  }

  drawSearchCircle(lat: number, lng: number): void {
    if (this.searchCircle) {
      this.map.removeLayer(this.searchCircle);
    }

    this.searchCircle = L.circle([lat, lng], {
      radius: this.radiusMeters,
      color: '#111827',
      fillColor: '#9ca3af',
      fillOpacity: 0.12
    }).addTo(this.map);
  }

  focusPlace(place: Place): void {
    this.map.setView([place.lat, place.lng], 16);
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
}