/**
 * Types representing the Logistics, Agencies, and Drivers System
 */

export interface Agency {
  id: string;
  code: string;       // e.g. "2593"
  name: string;       // e.g. "Pque. Chacabuco - Roma Cargas"
  address: string;    // e.g. "Pumacahua 1690"
  zoneId: string;     // e.g. "zona-sur"
}

export interface Zone {
  id: string;
  name: string;       // e.g. "Zona Sur", "Zona Norte"
  color: string;      // Tailwind class color for visual identification
}

export interface Driver {
  id: string;
  name: string;       // e.g. "Carlos Gómez"
  legajo: string;     // e.g. "L-4820"
  internalUnit: string; // e.g. "U-104"
  licensePlate: string; // e.g. "AF-123-XY"
}

export interface RouteStop {
  id: string;
  agencyId: string;
  sequence: number;
  scheduledTime: string;      // e.g. "09:30"
  packagesToDeliver: number;  // Bultos p/entrega
  packagesToCollect: number;  // Bultos Recol.
  actualPackagesDelivered?: number;
  actualPackagesCollected?: number;
  stopTime?: string;          // HH:MM
  observations?: string;
  recipientName?: string;     // Persona que recibe
  recipientSignature?: string; // Data URL of drawn signature
  status: 'pending' | 'completed' | 'skipped';
}

export interface RouteSheet {
  id: string;
  date: string;               // YYYY-MM-DD
  driverId: string;           // Ref to Driver
  driverName: string;         // Copy for easy history
  legajo: string;
  internalUnit: string;
  licensePlate: string;
  initialKm: number;
  finalKm?: number;
  departureTime?: string;     // HH:MM
  returnTime?: string;        // HH:MM
  stops: RouteStop[];
  status: 'draft' | 'assigned' | 'loading' | 'en_route' | 'completed';
  driverLoadSignature?: string; // Data URL of driver loading signature
  driverReturnSignature?: string; // Data URL of driver return signature
  observations?: string;
  createdAt: string;
}
