export type DietCategory = "HERBIVORE" | "CARNIVORE";

export interface OccupantSummary {
  id: number;
  name: string;
  species: string;
  diet_category: DietCategory;
  food_type: string;
  quantity_per_feeding_kg?: string;
  feedings_per_day?: number;
  feeding_times?: string[];
}

export interface Enclosure {
  id: number;
  name: string;
  section: string;
  notes: string;
  created_at: string;
  is_occupied: boolean;
  current_occupant: OccupantSummary | null;
}

export interface Occupant {
  id: number;
  enclosure: number;
  enclosure_name: string;
  name: string;
  species: string;
  diet_category: DietCategory;
  food_type: string;
  quantity_per_feeding_kg: string;
  feedings_per_day: number;
  feeding_times: string[];
  is_active: boolean;
  date_added: string;
  date_removed: string | null;
}

export interface NewOccupantPayload {
  enclosure: number;
  name: string;
  species: string;
  diet_category: DietCategory;
  food_type: string;
  quantity_per_feeding_kg: number;
  feedings_per_day: number;
  feeding_times: string[];
}

export interface FeedingEvent {
  time: string;
  occupant_id: number;
  occupant_name: string;
  species: string;
  enclosure: string;
  diet_category: DietCategory;
  food_type: string;
  quantity_kg: number;
}

export interface DailyFoodTotal {
  total_kg: number;
  by_diet_category: Record<string, number>;
  by_food_type: Record<string, number>;
}

export interface BackupSnapshot {
  enclosures: Array<{ id: number; name: string; section: string; notes: string }>;
  occupants: Array<Record<string, unknown>>;
}
