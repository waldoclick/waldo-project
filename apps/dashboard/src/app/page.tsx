'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesChart } from '@/components/sales-chart';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import {
  getOrders,
  groupSalesByMonth,
  getUniqueYears,
  StrapiOrder,
} from '@/lib/strapi';

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [allOrders, setAllOrders] = useState<StrapiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Obtener todas las órdenes
  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      let allOrdersData: StrapiOrder[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getOrders({
          page,
          pageSize: 100,
          sort: 'createdAt:desc',
        });

        allOrdersData = [...allOrdersData, ...response.data];

        // Verificar si hay más páginas basándose en el total y los datos obtenidos
        const totalPages = response.meta.pagination.pageCount;
        const totalItems = response.meta.pagination.total;

        if (
          response.data.length === 0 ||
          page >= totalPages ||
          allOrdersData.length >= totalItems
        ) {
          hasMore = false;
        } else {
          page++;
        }
      }

      setAllOrders(allOrdersData);
      const years = getUniqueYears(allOrdersData);
      setAvailableYears(years);

      // Si el año actual no está en los años disponibles, usar el más reciente
      if (years.length > 0) {
        const currentYear = new Date().getFullYear();
        if (!years.includes(currentYear)) {
          setSelectedYear(years[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  // Datos agrupados por mes para el año seleccionado
  const salesData = groupSalesByMonth(allOrders, selectedYear);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bienvenido a tu panel de control</p>
        </div>

        {/* Cuadro de Estadísticas de Ventas */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Estadísticas de Ventas</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    {selectedYear} <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {availableYears.map((year) => (
                    <DropdownMenuItem
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={selectedYear === year ? 'bg-gray-100' : ''}
                    >
                      {year}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Cargando datos...</div>
              </div>
            ) : (
              <SalesChart data={salesData} />
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Resumen
            </h3>
            <p className="text-gray-600">
              Aquí puedes ver un resumen de tu actividad
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Actividad Reciente
            </h3>
            <p className="text-gray-600">Últimas acciones en tu cuenta</p>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Configuración
            </h3>
            <p className="text-gray-600">Gestiona tu perfil y preferencias</p>
          </div>
        </div>
      </div>
    </div>
  );
}
