
import { LucideIcon } from 'lucide-react';

export enum UserRole {
  INTERNAL = 'INTERNAL', // Admin, Production Manager
  DRIVER = 'DRIVER',     // Logistics
  PARTNER = 'PARTNER',   // Retailers, Shops
  AGENT = 'AGENT'        // Sales Representative
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  subItems?: SubMenuItem[];
}

export interface SubMenuItem {
  id: string;
  label: string;
  description?: string; // For the placeholder view
}

export interface DashboardStat {
  label: string;
  value: string;
  trend: number; // Percentage
  trendUp: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string; // e.g. "Gyártás", "Logisztika"
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
}

export enum ProductCategory {
  RAW_MILK = 'RAW_MILK',
  INGREDIENT = 'INGREDIENT',
  PACKAGING = 'PACKAGING',
  WIP = 'WIP',
  FINISHED = 'FINISHED',
  SERVICE = 'SERVICE'
}

export interface Product {
  id: string;
  sku: string; // Cikkszám (egyedi)
  name: string;
  category: ProductCategory;
  uom: string; // Mértékegység (pl. db, kg, l)
  weightNetKg?: number;
  minStockThreshold?: number; // Riasztási szint
  sagaRefId?: string; // SAGA szinkron ID
  
  // Élelmiszerbiztonság (Opcionális, főleg Készterméknél)
  shelfLifeDays?: number;
  storageTempMin?: number;
  storageTempMax?: number;
  allergens?: string[];
}

// --- BESZÁLLÍTÓI TÍPUSOK ---

export type SupplierType = 'FARMER' | 'COLLECTION_POINT' | 'COOPERATIVE';
export type LegalType = 'COMPANY' | 'INDIVIDUAL';

export interface SupplierGroup {
  id: string;
  name: string;
  color: string; // CSS color or Tailwind class fragment
}

export interface Supplier {
  id: string;
  name: string;
  cui: string; 
  legalType: LegalType; // Új: Cég vagy Magánszemély
  exploitationCode: string; // Új: Cod de exploatare
  apiaCode: string; // Új: APIA kód
  hasSubsidy8: boolean; // Új: 8% támogatás opció
  
  // Banki adatok
  bankName: string;
  bankBranch: string;
  iban: string;

  type: SupplierType;
  groupId?: string; // Csoport azonosító
  parentSupplierId?: string; // ÚJ: Ha egy csarnokhoz (COLLECTION_POINT) tartozik
  address: string;
  phone: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastCollectionDate?: string;

  // SZÁMLÁZÁSI BEÁLLÍTÁSOK (Önszámlázáshoz)
  invoiceSeries?: string; // pl. "GAS"
  nextInvoiceNumber?: number; // pl. 101
}

// ÚJ: Szerződés entitás (Külön tárolva a beszállítótól)
export interface Contract {
  id: number;
  partnerId: number;
  partnerName: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  milkQuotaLiters: number;
  basePricePerLiter: number;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  notes?: string;
}

// ÚJ: Havi összesítő (Borderou) típus
export interface MonthlyCollectionSummary {
  id: string;
  month: string; // YYYY-MM
  supplierId: string; // Gazda ID
  collectionPointId?: string; // Csarnok ID
  totalLiters: number;
  avgFat: number;
  avgProtein: number;
  status: 'DRAFT' | 'FINALIZED';
}

// --- SZÁLLÍTMÁNY ÉS AVIZÓ TÍPUSOK ---

export type ShipmentStatus = 'IN_TRANSIT' | 'ARRIVED' | 'PROCESSING' | 'COMPLETED';

export interface DeliveryNote {
  id: string;
  supplierId: string;
  supplierName: string;
  plannedVolume: number;
  actualVolume: number;
  fatPercentage: number;
  proteinPercentage: number;
  temperature: number;
  ph: number;
  antibioticTest: 'NEGATIVE' | 'POSITIVE' | 'PENDING';
  hasSample: boolean; // Új mező: Van-e leadott minta?
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface Shipment {
  id: string;
  shipmentNumber: string; // pl. SHP-20231027-01
  vehiclePlate: string;
  driverName: string;
  departureTime: string;
  arrivalTime?: string;
  status: ShipmentStatus;
  totalVolume: number;
  avizos: DeliveryNote[];
}

// --- FLOTTA MENEDZSMENT TÍPUSOK ---

export enum VehicleType {
  MILK_TANKER = 'MILK_TANKER',   // Nyers tej begyűjtő
  REEFER_TRUCK = 'REEFER_TRUCK', // Hűtőkocsi
  PASSENGER = 'PASSENGER'        // Személyautó
}

export enum VehicleStatus {
  READY_TO_COLLECT = 'READY_TO_COLLECT', // Tiszta, indulhat
  DIRTY = 'DIRTY',                       // Használt, mosásra vár
  MAINTENANCE = 'MAINTENANCE',           // Szervizben
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'      // Végleg kivonva
}

export interface Compartment {
  id: number;
  capacityLiters: number;
  currentContent?: 'EMPTY' | 'BIO_MILK' | 'STD_MILK';
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  makeModel: string;
  type: VehicleType;
  status: VehicleStatus;
  
  // Kapacitás adatok
  totalCapacityLiters?: number; // Csak teherautóknál
  compartments?: Compartment[]; // Csak Milk Tanker
  
  // Okmányok lejárata
  itpExpiry: string; // Műszaki
  rcaExpiry: string; // Biztosítás
  
  // HACCP / Mosás
  lastWashTime?: string; // ISO Date string
  mileageKm: number;
}

export interface WashLog {
  id: string;
  vehicleId: string;
  timestamp: string;
  performedBy: string;
  chemicals: string[];
  temperature: number;
}
