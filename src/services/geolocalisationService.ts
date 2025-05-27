
import { SystemeGeolocalisation } from '../types';

class GeolocalisationService {
  private servicesActifs: string[] = ['GPS', 'Wifi', 'Bluetooth'];
  private localisations = new Map<string, { lat: number; lng: number }>();

  envoyerLocalisation(clientId: string): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            this.localisations.set(clientId, coords);
            console.log(`Localisation envoyée pour client ${clientId}:`, coords);
            resolve(coords);
          },
          (error) => {
            console.error('Erreur de géolocalisation:', error);
            reject(error);
          }
        );
      } else {
        reject(new Error('Géolocalisation non supportée'));
      }
    });
  }

  recupererLocalisation(clientId: string): { lat: number; lng: number } | null {
    return this.localisations.get(clientId) || null;
  }

  recupererLocalisationClient(clientId: string): { lat: number; lng: number } | null {
    return this.recupererLocalisation(clientId);
  }

  declencherDistributions(): void {
    console.log('Distributions déclenchées basées sur la géolocalisation');
  }
}

export const geolocalisationService = new GeolocalisationService();
