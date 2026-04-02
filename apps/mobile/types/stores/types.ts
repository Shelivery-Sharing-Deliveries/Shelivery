export interface LocationData {
  longitude: number;
  latitude: number;
  address?: string;
  placeName?: string;
}

export interface Shop {
  id: string;
  name: string;
  min_amount: number;
  logo_url: string | null;
  is_active: boolean;
}

export interface NearbyPool {
  pool_id: string;
  current_amount: number;
  min_amount: number;
  distance_km: number;
  member_count: number;
  address: string | null;
}