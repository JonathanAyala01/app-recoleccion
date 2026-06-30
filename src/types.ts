/**
 * Types representing the Logistics, Agencies, and Drivers System
 */

export interface Agency {
  id: string;
  code: string;
  name: string;
  address: string;
  zoneId: string;
}

export interface Zone {
  id: string;
  name: string;
  color: string;
}

export interface Driver {
  id: string;
  name: string;
  username: string;
  password: string;
  legajo: string;
  internalUnit: string;
  licensePlate: string;
}

export interface RouteStop {
  id: string;
  agencyId: string;
  sequence: number;
  scheduledTime: string;
  packagesToDeliver: number;
  packagesToCollect: number;
  actualPackagesDelivered?: number;
  actualPackagesCollected?: number;
  stopTime?: string;
  observations?: string;
  recipientName?: string;
  recipientSignature?: string;
  status: 'pending' | 'completed' | 'skipped';
}

export interface RouteSheet {
  id: string;
  date: string;
  driverId: string;
  driverName: string;
  legajo: string;
  internalUnit: string;
  licensePlate: string;
  initialKm: number;
  finalKm?: number;
  departureTime?: string;
  returnTime?: string;
  stops: RouteStop[];
  status: 'draft' | 'assigned' | 'loading' | 'en_route' | 'completed';
  driverLoadSignature?: string;
  driverReturnSignature?: string;
  observations?: string;
  createdAt: string;
}
