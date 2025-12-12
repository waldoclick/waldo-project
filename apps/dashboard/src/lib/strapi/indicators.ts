import { strapiClient } from './client';

export interface Indicator {
  code: string;
  name: string;
  unit: string;
  value: number;
}

export interface IndicatorsResponse {
  data: Indicator[];
  meta: {
    timestamp: string;
  };
}

// Obtener todos los indicadores económicos
export async function getIndicators(): Promise<IndicatorsResponse> {
  return strapiClient.get<IndicatorsResponse>('/indicators');
}
