
export type SystemType = 'Off-grid' | 'Hybrid' | 'Grid-tie';
export type BatteryType = 'Lithium' | 'AGM' | 'Gel';
export type BudgetLevel = 'Low' | 'Medium' | 'High';
export type LoadMethod = 'manual' | 'appliance' | 'bill';
export type InverterType = 'Pure Sine Wave' | 'Modified Sine Wave' | 'Hybrid' | 'Off-grid';

export interface Appliance {
  id: string;
  name: string;
  qty: number;
  watts: number;
  hours: number;
  efficiency: number;
}

export interface Obstruction {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'fixed' | 'shaded';
  shadeDirection?: 'N' | 'S' | 'E' | 'W';
}

export interface SolarSystemInput {
  country: string;
  city: string;
  latitude?: number;
  longitude?: number;
  daily_kwh: number;
  peak_watts: number;
  roof_type: string;
  roof_size: number;
  sun_hours: number;
  system_type: SystemType;
  backup_hours: number;
  battery_type: BatteryType;
  budget_level: BudgetLevel;
  target_budget: number;
  obstructions: Obstruction[];
  load_method: LoadMethod;
  currency_symbol: string;
  appliances?: Appliance[];
  uploaded_bill?: {
    data: string;
    mimeType: string;
    fileName: string;
  };
}

export interface SolarSystemResult {
  energy_summary: {
    daily_consumption_kwh: number;
    peak_load_watts: number;
    backup_hours: number;
  };
  monthly_production: {
    data: { month: string; kwh: number }[];
    average_kwh: number;
    best_month: { name: string; kwh: number };
    worst_month: { name: string; kwh: number };
    annual_total_kwh: number;
  };
  solar_panels: {
    recommended_panel_wattage: number;
    number_of_panels: number;
    total_solar_capacity_kw: number;
    estimated_daily_generation_kwh: number;
  };
  inverter: {
    type: string;
    recommended_size_kw: number;
    supported_peak_load_watts: number;
  };
  battery: {
    type: string;
    total_storage_kwh: number;
    number_of_batteries: number;
    estimated_backup_hours: number;
    bms_intelligence?: {
      charge_limit_amps: number;
      discharge_limit_amps: number;
      temp_range_celsius: string;
      estimated_cycle_life: number;
      protection_features: string[];
    };
  };
  system_losses: {
    loss_percentage: string;
    adjusted_energy_requirement_kwh: number;
    loss_breakdown: { factor: string; percentage: number }[];
  };
  budget_guard: {
    status: string;
    target_budget_display: string;
    estimated_total_cost_range: string;
    cost_utilization_percentage: number;
    savings_vs_utility_annually: string;
    optimization_strategy: string;
    market_average_price_regional: string;
  };
  market_intelligence: {
    name: string;
    brand: string;
    estimated_price: string;
    description: string;
    source_url: string;
  }[];
  installation_notes: {
    title: string;
    detail: string;
  }[];
  future_expansion: {
    max_additional_panels: number;
    inverter_headroom: string;
  };
}

export interface SimulatorInput {
  panelCount: number;
  panelWatts: number;
  inverterSizeKw: number;
  inverterType: InverterType;
  batteryCapacityKwh: number;
  batteryType: BatteryType;
}
