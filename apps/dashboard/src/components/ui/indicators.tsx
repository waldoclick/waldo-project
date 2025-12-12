'use client';

import { useIndicators } from '@/hooks/api';
import {
  Building2,
  DollarSign,
  Euro,
  Calculator,
  TrendingUp,
} from 'lucide-react';

interface IndicatorsProps {
  className?: string;
}

const getIndicatorIcon = (code: string) => {
  const iconMap: Record<string, typeof Building2> = {
    uf: Building2,
    dolar: DollarSign,
    euro: Euro,
    utm: Calculator,
    ipc: TrendingUp,
  };
  return iconMap[code] || Building2;
};

const getShortName = (code: string) => {
  const names: Record<string, string> = {
    uf: 'UF',
    dolar: 'USD',
    euro: 'EUR',
    utm: 'UTM',
    ipc: 'IPC',
  };
  return names[code] || code.toUpperCase();
};

const formatValue = (value: number, unit: string) => {
  if (unit === 'Porcentaje') {
    return `${value}%`;
  }
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: unit === 'Pesos' ? 0 : 2,
  }).format(value);
};

export function Indicators({ className }: IndicatorsProps) {
  const { indicators, loading } = useIndicators();

  if (loading || indicators.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-6 ${className || ''}`}>
      {indicators.map((indicator) => {
        const Icon = getIndicatorIcon(indicator.code);
        return (
          <div
            key={indicator.code}
            className="flex items-center gap-1.5 text-sm"
          >
            <Icon className="h-4 w-4 text-blue-500" />
            <span className="text-gray-500">
              {getShortName(indicator.code)}
            </span>
            <span className="font-semibold text-gray-900">
              {formatValue(indicator.value, indicator.unit)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
