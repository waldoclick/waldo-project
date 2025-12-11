'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { SalesByMonthData } from '@/lib/strapi';

interface SalesChartProps {
  data: SalesByMonthData[];
}

export function SalesChart({ data }: SalesChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const formatCurrencyTooltip = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getFullMonthName = (abbrev: string): string => {
    const monthMap: Record<string, string> = {
      Ene: 'Enero',
      Feb: 'Febrero',
      Mar: 'Marzo',
      Abr: 'Abril',
      May: 'Mayo',
      Jun: 'Junio',
      Jul: 'Julio',
      Ago: 'Agosto',
      Sep: 'Septiembre',
      Oct: 'Octubre',
      Nov: 'Noviembre',
      Dic: 'Diciembre',
    };
    return monthMap[abbrev] || abbrev;
  };

  // Calcular el promedio de ventas
  const average = data.reduce((sum, item) => sum + item.monto, 0) / data.length;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
        <ReferenceLine
          y={average}
          stroke="#000"
          strokeDasharray="5 5"
          label={{
            value: 'x̄',
            position: 'right',
            fill: '#000',
            fontSize: 11,
          }}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrencyTooltip(value), 'Monto']}
          labelFormatter={(label: string) => getFullMonthName(label)}
          labelStyle={{ color: '#000', fontSize: '11px' }}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '11px',
          }}
          itemStyle={{ color: '#000', fontSize: '11px' }}
        />
        <Bar dataKey="monto" fill="#ffd699" />
      </BarChart>
    </ResponsiveContainer>
  );
}
