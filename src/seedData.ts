import { Agency, Zone, Driver, InternalUnit } from './types';

export const INITIAL_ZONES: Zone[] = [
  { id: 'zona-oeste', name: 'Zona Flores / Paternal', color: 'indigo' },
  { id: 'zona-centro', name: 'Zona Centro / Once', color: 'emerald' },
  { id: 'zona-sur', name: 'Zona Sur (Alsina/Lanús/Soldati)', color: 'amber' },
  { id: 'zona-este', name: 'Zona Parque Chacabuco / Patricios', color: 'rose' }
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'Carlos Gómez',
    username: 'carlos.gomez',
    password: '1234',
    legajo: 'L-5421',
    internalUnit: 'U-108',
    licensePlate: 'AF-321-JK'
  },
  {
    id: 'drv-2',
    name: 'Juan Manuel Rodríguez',
    username: 'juan.rodriguez',
    password: '1234',
    legajo: 'L-2918',
    internalUnit: 'U-214',
    licensePlate: 'AE-892-LL'
  },
  {
    id: 'drv-3',
    name: 'Mariano Silva',
    username: 'mariano.silva',
    password: '1234',
    legajo: 'L-7740',
    internalUnit: 'U-305',
    licensePlate: 'AG-404-ZX'
  },
  {
    id: 'drv-4',
    name: 'Eduardo Martínez',
    username: 'eduardo.martinez',
    password: '1234',
    legajo: 'L-1105',
    internalUnit: 'U-112',
    licensePlate: 'AD-556-PO'
  }
];

export const INITIAL_INTERNALS: InternalUnit[] = [
  { id: 'int-1', code: 'U-108', licensePlate: 'AF-321-JK', status: 'operativo', description: 'Camión principal' },
  { id: 'int-2', code: 'U-214', licensePlate: 'AE-892-LL', status: 'operativo', description: 'Camión secundario' },
  { id: 'int-3', code: 'U-305', licensePlate: 'AG-404-ZX', status: 'operativo', description: 'Unidad liviana' },
  { id: 'int-4', code: 'U-112', licensePlate: 'AD-556-PO', status: 'operativo', description: 'Backup operativo' }
];

export const INITIAL_AGENCIES: Agency[] = [
  {
    id: 'age-1',
    code: '2593',
    name: 'Pque. Chacabuco - Roma Cargas',
    address: 'Pumacahua 1690',
    zoneId: 'zona-este'
  },
  {
    id: 'age-2',
    code: '1001',
    name: 'Pque. Patricios',
    address: 'Monasterio 301',
    zoneId: 'zona-este'
  },
  {
    id: 'age-3',
    code: '2227',
    name: 'Pque. Avellaneda - Encom. La Roca',
    address: 'AV. San Juan B. DE LA SALLE 1926',
    zoneId: 'zona-oeste'
  },
  {
    id: 'age-4',
    code: '2645',
    name: '64 Wolfpack Logistics',
    address: 'Av. Juan Bautista Justo 6400',
    zoneId: 'zona-oeste'
  },
  {
    id: 'age-5',
    code: '2329',
    name: 'Paternal - Mostto',
    address: 'Terrero 2102',
    zoneId: 'zona-oeste'
  },
  {
    id: 'age-6',
    code: '09',
    name: 'FLORES SENDBOX - Encomiendas 3.0',
    address: 'Av. Nazca 723',
    zoneId: 'zona-oeste'
  },
  {
    id: 'age-7',
    code: '2123',
    name: 'Flores - Logística real',
    address: 'Gral. Venancio Flores 3137',
    zoneId: 'zona-oeste'
  },
  {
    id: 'age-8',
    code: '2702',
    name: 'Flores Logística',
    address: 'Morón 3008',
    zoneId: 'zona-oeste'
  },
  {
    id: 'age-9',
    code: '2695',
    name: 'Flores Gus - Transporte',
    address: 'Av. Gaona 3750',
    zoneId: 'zona-oeste'
  },
  {
    id: 'age-10',
    code: '2703',
    name: 'Flores - Villareal transportes',
    address: 'Av. Nazca 1070',
    zoneId: 'zona-oeste'
  },
  {
    id: 'age-11',
    code: '2335',
    name: 'Balvanera (bsas) DM encom.',
    address: 'Av. Independencia 1823',
    zoneId: 'zona-centro'
  },
  {
    id: 'age-12',
    code: '2273',
    name: 'V. Alsina - E A Encom.',
    address: 'Av. Remedios de Escalada de San Martín 2282',
    zoneId: 'zona-sur'
  },
  {
    id: 'age-13',
    code: '2045',
    name: 'Encom. Lanús',
    address: 'Av. Hipólito Yrigoyen 4609',
    zoneId: 'zona-sur'
  },
  {
    id: 'age-14',
    code: '2253',
    name: 'Villa Soldati - Encom. Soldati',
    address: 'Av. Int. Francisco Rabanal 2701',
    zoneId: 'zona-sur'
  },
  {
    id: 'age-15',
    code: '2048',
    name: 'Congreso - Paquetería Mercado Envíos',
    address: 'Sarmiento 1959',
    zoneId: 'zona-centro'
  },
  {
    id: 'age-16',
    code: '8',
    name: 'Once Sendbox - Encom. Express',
    address: 'Av. San Juan 4172',
    zoneId: 'zona-centro'
  }
];
