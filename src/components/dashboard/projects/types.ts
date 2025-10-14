// Project component types
export interface ProjectFormType {
  clientId: string;
  name: string;
  code: string;
  siteAddress?: string;
  siteLat?: number | null;
  siteLng?: number | null;
  sitePlaceId?: string;
  startDate?: string;
  endDate?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'inactive' | 'deleted';
  notes?: string;
}

