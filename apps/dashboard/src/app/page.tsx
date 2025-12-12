'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '@/stores/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesChart } from '@/components/sales-chart';
import { StatCard } from '@/components/ui/stat-card';
import { Indicators } from '@/components/ui/indicators';
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
  ShoppingCart,
  Users,
  Tag,
  FileCheck,
  HelpCircle,
  MapPin,
  Building,
  Box,
  Calendar,
  Star,
  Circle,
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
  getUsers,
  getCategories,
  getConditions,
  getFaqs,
  getAdPacks,
  getRegions,
  getCommunes,
  getUsedReservations,
  getFreeReservations,
  getUsedFeaturedReservations,
  getFreeFeaturedReservations,
} from '@/lib/strapi';

export default function DashboardPage() {
  const { user } = useUserStore();
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
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    orders: 0,
    users: 0,
    categories: 0,
    conditions: 0,
    faqs: 0,
    packs: 0,
    regions: 0,
    communes: 0,
    usedReservations: 0,
    freeReservations: 0,
    usedFeatured: 0,
    freeFeatured: 0,
  });

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

  // Obtener estadísticas generales
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const [
        ordersResponse,
        usersResponse,
        categoriesResponse,
        conditionsResponse,
        faqsResponse,
        packsResponse,
        regionsResponse,
        communesResponse,
        usedReservationsResponse,
        freeReservationsResponse,
        usedFeaturedResponse,
        freeFeaturedResponse,
      ] = await Promise.all([
        getOrders({ pageSize: 1 }),
        getUsers({ pageSize: 1 }),
        getCategories({ pageSize: 1 }),
        getConditions({ pageSize: 1 }),
        getFaqs({ pageSize: 1 }),
        getAdPacks({ pageSize: 1 }),
        getRegions({ pageSize: 1 }),
        getCommunes({ pageSize: 1 }),
        getUsedReservations({ pageSize: 1 }),
        getFreeReservations({ pageSize: 1 }),
        getUsedFeaturedReservations({ pageSize: 1 }),
        getFreeFeaturedReservations({ pageSize: 1 }),
      ]);

      setStats({
        orders: ordersResponse.meta.pagination.total,
        users: usersResponse.meta.pagination.total,
        categories: categoriesResponse.meta.pagination.total,
        conditions: conditionsResponse.meta.pagination.total,
        faqs: faqsResponse.meta.pagination.total,
        packs: packsResponse.meta.pagination.total,
        regions: regionsResponse.meta.pagination.total,
        communes: communesResponse.meta.pagination.total,
        usedReservations: usedReservationsResponse.meta.pagination.total,
        freeReservations: freeReservationsResponse.meta.pagination.total,
        usedFeatured: usedFeaturedResponse.meta.pagination.total,
        freeFeatured: freeFeaturedResponse.meta.pagination.total,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllOrders();
    fetchAdsStats();
    fetchStats();
  }, [fetchAllOrders, fetchAdsStats, fetchStats]);

  // Datos agrupados por mes para el año seleccionado
  const salesData = groupSalesByMonth(allOrders, selectedYear);

  // Obtener saludo según la hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Obtener nombre del usuario
  const getUserName = () => {
    if (user?.username) {
      // Capitalizar primera letra del username
      return user.username.charAt(0).toUpperCase() + user.username.slice(1);
    }
    return 'Usuario';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {getUserName()}!
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Aquí está lo que está pasando con tus anuncios hoy
            </p>
          </div>
          <Indicators className="hidden lg:flex" />
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
        <Card className="w-full !bg-white !rounded-sm !shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Estadísticas de Ventas</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 !rounded-sm"
                  >
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

        {/* Tarjetas de Reservas y Destacados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Reservas Usadas"
            value={statsLoading ? '...' : stats.usedReservations}
            link={{
              text: 'Ver reservas usadas',
              href: '/reservations/used',
            }}
            icon={CheckCircle}
            iconColor="text-sky-500"
            iconBgColor="bg-sky-500/20"
          />
          <StatCard
            title="Reservas Libres"
            value={statsLoading ? '...' : stats.freeReservations}
            link={{
              text: 'Ver reservas libres',
              href: '/reservations/free',
            }}
            icon={Circle}
            iconColor="text-sky-500"
            iconBgColor="bg-sky-500/20"
          />
          <StatCard
            title="Destacados Usados"
            value={statsLoading ? '...' : stats.usedFeatured}
            link={{
              text: 'Ver destacados usados',
              href: '/features/used',
            }}
            icon={CheckCircle}
            iconColor="text-amber-500"
            iconBgColor="bg-amber-500/20"
          />
          <StatCard
            title="Destacados Libres"
            value={statsLoading ? '...' : stats.freeFeatured}
            link={{
              text: 'Ver destacados libres',
              href: '/features/free',
            }}
            icon={Circle}
            iconColor="text-amber-500"
            iconBgColor="bg-amber-500/20"
          />
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Órdenes"
            value={statsLoading ? '...' : stats.orders}
            link={{
              text: 'Ver órdenes',
              href: '/sales',
            }}
            icon={ShoppingCart}
            iconColor="text-sky-500"
            iconBgColor="bg-sky-500/20"
          />
          <StatCard
            title="Usuarios"
            value={statsLoading ? '...' : stats.users}
            link={{
              text: 'Ver usuarios',
              href: '/users',
            }}
            icon={Users}
            iconColor="text-violet-500"
            iconBgColor="bg-violet-500/20"
          />
          <StatCard
            title="Categorías"
            value={statsLoading ? '...' : stats.categories}
            link={{
              text: 'Ver categorías',
              href: '/categories',
            }}
            icon={Tag}
            iconColor="text-rose-500"
            iconBgColor="bg-rose-500/20"
          />
          <StatCard
            title="Condiciones"
            value={statsLoading ? '...' : stats.conditions}
            link={{
              text: 'Ver condiciones',
              href: '/conditions',
            }}
            icon={FileCheck}
            iconColor="text-amber-500"
            iconBgColor="bg-amber-500/20"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="FAQ"
            value={statsLoading ? '...' : stats.faqs}
            link={{
              text: 'Ver FAQs',
              href: '/faqs',
            }}
            icon={HelpCircle}
            iconColor="text-indigo-500"
            iconBgColor="bg-indigo-500/20"
          />
          <StatCard
            title="Packs"
            value={statsLoading ? '...' : stats.packs}
            link={{
              text: 'Ver packs',
              href: '/packs',
            }}
            icon={Box}
            iconColor="text-pink-500"
            iconBgColor="bg-pink-500/20"
          />
          <StatCard
            title="Regiones"
            value={statsLoading ? '...' : stats.regions}
            link={{
              text: 'Ver regiones',
              href: '/regions',
            }}
            icon={MapPin}
            iconColor="text-teal-500"
            iconBgColor="bg-teal-500/20"
          />
          <StatCard
            title="Comunas"
            value={statsLoading ? '...' : stats.communes}
            link={{
              text: 'Ver comunas',
              href: '/communes',
            }}
            icon={Building}
            iconColor="text-cyan-500"
            iconBgColor="bg-cyan-500/20"
          />
        </div>
      </div>
    </div>
  );
}
