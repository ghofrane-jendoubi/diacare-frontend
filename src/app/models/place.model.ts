export interface Place {
  id: string;
  name: string;
  type: 'medecin' | 'nutritionniste' | 'pharmacie' | 'patient' | 'laboratoire';
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  openNow?: boolean;
  distanceKm?: number;
}