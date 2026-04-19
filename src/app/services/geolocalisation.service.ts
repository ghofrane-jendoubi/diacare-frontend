import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import { Place } from '../models/place.model';

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

@Injectable({
  providedIn: 'root'
})
export class GeolocalisationService {
  private readonly overpassUrl = 'https://overpass-api.de/api/interpreter';
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  getNearbyPlaces(lat: number, lng: number, radiusMeters = 3000): Observable<Place[]> {
    const query = `
      [out:json][timeout:25];
      (
        node(around:${radiusMeters},${lat},${lng})["amenity"="doctors"];
        way(around:${radiusMeters},${lat},${lng})["amenity"="doctors"];
        relation(around:${radiusMeters},${lat},${lng})["amenity"="doctors"];

        node(around:${radiusMeters},${lat},${lng})["healthcare"="doctor"];
        way(around:${radiusMeters},${lat},${lng})["healthcare"="doctor"];
        relation(around:${radiusMeters},${lat},${lng})["healthcare"="doctor"];

        node(around:${radiusMeters},${lat},${lng})["amenity"="pharmacy"];
        way(around:${radiusMeters},${lat},${lng})["amenity"="pharmacy"];
        relation(around:${radiusMeters},${lat},${lng})["amenity"="pharmacy"];

        node(around:${radiusMeters},${lat},${lng})["healthcare"="nutrition_counselling"];
        way(around:${radiusMeters},${lat},${lng})["healthcare"="nutrition_counselling"];
        relation(around:${radiusMeters},${lat},${lng})["healthcare"="nutrition_counselling"];

        node(around:${radiusMeters},${lat},${lng})["amenity"="laboratory"];
        way(around:${radiusMeters},${lat},${lng})["amenity"="laboratory"];
        relation(around:${radiusMeters},${lat},${lng})["amenity"="laboratory"];
      );
      out center tags;
    `.trim();

    return this.http.post(this.overpassUrl, query, {
      responseType: 'json',
      headers: { 'Content-Type': 'text/plain' }
    }).pipe(
      map((response: unknown) => response as OverpassResponse),
      map((response: OverpassResponse) =>
        response.elements
          .map((el: OverpassElement) => this.toPlace(el, lat, lng))
          .filter((p): p is Place => p !== null)
          .sort((a: Place, b: Place) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
      )
    );
  }

  searchAddress(query: string): Observable<{ lat: number; lng: number; label: string }[]> {
    if (!query.trim()) return of([]);

    const url = `${this.nominatimUrl}?format=json&q=${encodeURIComponent(query)}&limit=5`;
    return this.http.get<unknown[]>(url, {
      headers: {
        'Accept-Language': 'fr'
      }
    }).pipe(
      map((results: unknown[]) =>
        results.map((item: any) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          label: item.display_name
        }))
      )
    );
  }

  private toPlace(el: OverpassElement, userLat: number, userLng: number): Place | null {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    const tags = el.tags ?? {};

    if (lat == null || lng == null) return null;

    const type = this.detectType(tags);
    if (!type) return null;

    return {
      id: `${el.id}-${type}`,
      name: tags['name'] || this.defaultName(type),
      type,
      address: this.buildAddress(tags),
      lat,
      lng,
      phone: tags['phone'] || tags['contact:phone'] || '',
      website: tags['website'] || tags['contact:website'] || '',
      openNow: this.parseOpenNow(tags['opening_hours']),
      distanceKm: this.calculateDistanceKm(userLat, userLng, lat, lng)
    };
  }

  private detectType(tags: Record<string, string>): Place['type'] | null {
    if (tags['amenity'] === 'pharmacy') return 'pharmacie';
    if (tags['amenity'] === 'laboratory') return 'laboratoire';
    if (tags['amenity'] === 'doctors' || tags['healthcare'] === 'doctor') return 'medecin';
    if (tags['healthcare'] === 'nutrition_counselling') return 'nutritionniste';
    return null;
  }

  private defaultName(type: Place['type']): string {
    switch (type) {
      case 'medecin': return 'Médecin';
      case 'nutritionniste': return 'Nutritionniste';
      case 'pharmacie': return 'Pharmacie';
      case 'patient': return 'Patient';
      case 'laboratoire': return 'Laboratoire';
      default: return 'Lieu';
    }
  }

  private buildAddress(tags: Record<string, string>): string {
    const parts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:city']
    ].filter(Boolean);

    return parts.length ? parts.join(', ') : 'Adresse non disponible';
  }

  private parseOpenNow(openingHours?: string): boolean | undefined {
    if (!openingHours) return undefined;
    return openingHours.toLowerCase().includes('24/7') ? true : undefined;
  }

  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  private toRad(v: number): number {
    return (v * Math.PI) / 180;
  }
}