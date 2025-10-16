// Type definitions for Inventory components

export type StackabilityType = 'stackable' | 'non_stackable' | 'top_only' | 'bottom_only';
export type InventoryStatusType = 'in_storage' | 'reserved' | 'on_truck' | 'onsite' | 'returned';

export interface InventoryFormType {
  // Item details
  clientId: string;
  projectId: string;
  label: string;
  sku: string;
  description: string;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  weightKg: number;
  stackability: StackabilityType;
  topLoadRatingKg: number;
  orientationLocked: boolean;
  fragile: boolean;
  keepUpright: boolean;
  priority: number | null;
  
  // Inventory unit details
  palletNo: string;
  inventoryDate: string;
  locationSite: string;
  locationAisle: string;
  locationBay: string;
  locationLevel: string;
  locationNotes: string;
  quantity: number;
  status: InventoryStatusType;
}

export interface ItemType {
  id: string;
  label: string;
  sku: string | null;
  description: string | null;
  length_mm: number;
  width_mm: number;
  height_mm: number;
  weight_kg: number;
  volume_m3: number;
  stackability: StackabilityType;
  top_load_rating_kg: number | null;
  orientation_locked: boolean | null;
  priority: number | null;
  fragile: boolean | null;
  keep_upright: boolean | null;
}

export interface ClientType {
  id: string;
  full_name: string | null;
  company_name: string | null;
  email: string;
}

export interface ProjectType {
  id: string;
  name: string;
  code: string;
}

export interface InventoryUnitType extends Record<string, unknown> {
  id: string;
  item_id: string;
  client_id: string;
  project_id: string | null;
  pallet_no: string | null;
  inventory_date: string;
  location_site: string;
  location_latitude: number | null;
  location_longitude: number | null;
  location_aisle: string | null;
  location_bay: string | null;
  location_level: string | null;
  location_notes: string | null;
  quantity: number;
  status: InventoryStatusType;
  last_inspection_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined relations
  item?: ItemType;
  client?: ClientType;
  project?: ProjectType;
}

export interface MediaType {
  id: string;
  url: string;
  tag: 'pallet' | 'label' | 'racking' | 'onsite';
  content_type: string | null;
  width_px: number | null;
  height_px: number | null;
  taken_at: string | null;
  created_at: string;
}

export interface MovementType {
  id: string;
  from_status: InventoryStatusType | null;
  to_status: InventoryStatusType;
  from_location: Record<string, unknown> | null;
  to_location: Record<string, unknown> | null;
  note: string | null;
  created_at: string;
  created_by_user?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface InventoryStatsType {
  totalUnits: number;
  inStorage: number;
  reserved: number;
  onTruck: number;
  onsite: number;
  returned: number;
  totalVolume: number;
  totalWeight: number;
}

