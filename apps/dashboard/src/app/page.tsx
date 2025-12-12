'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesChart } from '@/components/sales-chart';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  Clock,
  CheckCircle,
  Archive,
  XCircle,
} from 'lucide-react';
import {
  getOrders,
  groupSalesByMonth,
  getUniqueYears,
  StrapiOrder,
  getPendingAdsCount,
  getActiveAdsCount,
  getArchivedAdsCount,
  getRejectedAdsCount,
} from '@/lib/strapi';

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [allOrders, setAllOrders] = useState<StrapiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [adsStats, setAdsStats] = useState({
    pending: 0,
    active: 0,
    archived: 0,
    rejected: 0,
  });
  const [adsLoading, setAdsLoading] = useState(true);

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

  // Obtener estadísticas de anuncios
  const fetchAdsStats = useCallback(async () => {
    try {
      setAdsLoading(true);
      const [pending, active, archived, rejected] = await Promise.all([
        getPendingAdsCount(),
        getActiveAdsCount(),
        getArchivedAdsCount(),
        getRejectedAdsCount(),
      ]);

      setAdsStats({
        pending,
        active,
        archived,
        rejected,
      });
    } catch (error) {
      console.error('Error fetching ads stats:', error);
    } finally {
      setAdsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllOrders();
    fetchAdsStats();
  }, [fetchAllOrders, fetchAdsStats]);

  // Datos agrupados por mes para el año seleccionado
  const salesData = groupSalesByMonth(allOrders, selectedYear);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bienvenido a tu panel de control</p>
        </div>

        {/* Cards de Estadísticas de Anuncios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Anuncios Pendientes"
            value={adsLoading ? '...' : adsStats.pending}
            link={{
              text: 'Ver pendientes',
              href: '/ads/pending',
            }}
            icon={Clock}
            iconColor="text-yellow-500"
            iconBgColor="bg-yellow-500/20"
          />
          <StatCard
            title="Anuncios Publicados"
            value={adsLoading ? '...' : adsStats.active}
            link={{
              text: 'Ver publicados',
              href: '/ads/active',
            }}
            icon={CheckCircle}
            iconColor="text-green-500"
            iconBgColor="bg-green-500/20"
          />
          <StatCard
            title="Anuncios Archivados"
            value={adsLoading ? '...' : adsStats.archived}
            link={{
              text: 'Ver archivados',
              href: '/ads/archived',
            }}
            icon={Archive}
            iconColor="text-blue-500"
            iconBgColor="bg-blue-500/20"
          />
          <StatCard
            title="Anuncios Rechazados"
            value={adsLoading ? '...' : adsStats.rejected}
            link={{
              text: 'Ver rechazados',
              href: '/ads/rejected',
            }}
            icon={XCircle}
            iconColor="text-red-500"
            iconBgColor="bg-red-500/20"
          />
        </div>

        {/* Cuadro de Estadísticas de Ventas */}
        <Card className="w-full !bg-white !rounded-md !shadow-sm !border-0">
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
          <CardContent className="pl-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Cargando datos...</div>
              </div>
            ) : (
              <SalesChart data={salesData} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
