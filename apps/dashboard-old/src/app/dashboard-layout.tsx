'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import {
  getPendingAdsCount,
  getActiveAdsCount,
  getArchivedAdsCount,
  getRejectedAdsCount,
} from '@/lib/strapi';
import {
  FileText,
  ShoppingCart,
  MapPin,
  Building,
  Tag,
  HelpCircle,
  Package,
  Users,
  Menu,
  X,
  Box,
  Calendar,
  Star,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Clock,
  CheckCircle,
  Archive,
  XCircle,
  Circle,
  FileCheck,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adsMenuOpen, setAdsMenuOpen] = useState(false);
  const [featuresMenuOpen, setFeaturesMenuOpen] = useState(false);
  const [reservationsMenuOpen, setReservationsMenuOpen] = useState(false);
  const [maintainersMenuOpen, setMaintainersMenuOpen] = useState(false);
  const [adsCounts, setAdsCounts] = useState({
    pending: 0,
    active: 0,
    archived: 0,
    rejected: 0,
  });
  const pathname = usePathname();

  const isMaintainersActive =
    pathname.startsWith('/categories') ||
    pathname.startsWith('/conditions') ||
    pathname.startsWith('/faqs') ||
    pathname.startsWith('/packs') ||
    pathname.startsWith('/regions') ||
    pathname.startsWith('/communes');

  const getOpacityClass = (
    isActive: boolean,
    isParentActive: boolean = false
  ) => {
    if (isActive || isParentActive) {
      return 'opacity-100';
    }
    return 'opacity-50';
  };

  // Obtener contadores de anuncios
  useEffect(() => {
    const fetchAdsCounts = async () => {
      try {
        const [pending, active, archived, rejected] = await Promise.all([
          getPendingAdsCount(),
          getActiveAdsCount(),
          getArchivedAdsCount(),
          getRejectedAdsCount(),
        ]);
        setAdsCounts({ pending, active, archived, rejected });
      } catch (error) {
        console.error('Error fetching ads counts:', error);
      }
    };
    fetchAdsCounts();
  }, []);

  // Abrir automáticamente los menús cuando la ruta coincide
  useEffect(() => {
    if (pathname.startsWith('/ads')) {
      setAdsMenuOpen(true);
      setFeaturesMenuOpen(false);
      setReservationsMenuOpen(false);
      setMaintainersMenuOpen(false);
    } else if (pathname.startsWith('/features')) {
      setFeaturesMenuOpen(true);
      setAdsMenuOpen(false);
      setReservationsMenuOpen(false);
      setMaintainersMenuOpen(false);
    } else if (pathname.startsWith('/reservations')) {
      setReservationsMenuOpen(true);
      setAdsMenuOpen(false);
      setFeaturesMenuOpen(false);
      setMaintainersMenuOpen(false);
    } else if (isMaintainersActive) {
      setMaintainersMenuOpen(true);
      setAdsMenuOpen(false);
      setFeaturesMenuOpen(false);
      setReservationsMenuOpen(false);
    } else {
      // Si no coincide con ningún menú, cerrar todos
      setAdsMenuOpen(false);
      setFeaturesMenuOpen(false);
      setReservationsMenuOpen(false);
      setMaintainersMenuOpen(false);
    }
  }, [pathname, isMaintainersActive]);

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      href: '/',
    },
    {
      name: 'Órdenes',
      icon: ShoppingCart,
      href: '/sales',
    },
    {
      name: 'Reservas',
      icon: Calendar,
      href: '/reservations',
    },
    {
      name: 'Destacados',
      icon: Star,
      href: '/features',
    },
    {
      name: 'Usuarios',
      icon: Users,
      href: '/users',
    },
  ];

  const maintainersSubMenuItems = [
    {
      name: 'Categorías',
      icon: Tag,
      href: '/categories',
    },
    {
      name: 'Condiciones',
      icon: FileCheck,
      href: '/conditions',
    },
    {
      name: 'FAQ',
      icon: HelpCircle,
      href: '/faqs',
    },
    {
      name: 'Packs',
      icon: Box,
      href: '/packs',
    },
    {
      name: 'Regiones',
      icon: MapPin,
      href: '/regions',
    },
    {
      name: 'Comunas',
      icon: Building,
      href: '/communes',
    },
  ];

  const adsSubMenuItems = [
    {
      name: 'Pendientes',
      icon: Clock,
      href: '/ads/pending',
      countKey: 'pending' as const,
    },
    {
      name: 'Activos',
      icon: CheckCircle,
      href: '/ads/active',
      countKey: 'active' as const,
    },
    {
      name: 'Archivados',
      icon: Archive,
      href: '/ads/archived',
      countKey: 'archived' as const,
    },
    {
      name: 'Rechazados',
      icon: XCircle,
      href: '/ads/rejected',
      countKey: 'rejected' as const,
    },
  ];

  const featuresSubMenuItems = [
    {
      name: 'Usados',
      icon: CheckCircle,
      href: '/features/used',
    },
    {
      name: 'Libres',
      icon: Circle,
      href: '/features/free',
    },
  ];

  const reservationsSubMenuItems = [
    {
      name: 'Usadas',
      icon: CheckCircle,
      href: '/reservations/used',
    },
    {
      name: 'Libres',
      icon: Circle,
      href: '/reservations/free',
    },
  ];

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
        <meta name="bingbot" content="noindex, nofollow" />
        <meta name="slurp" content="noindex, nofollow" />
        <meta name="duckduckbot" content="noindex, nofollow" />
        <meta name="baiduspider" content="noindex, nofollow" />
        <meta name="yandex" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen flex bg-gray-50">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Fixed */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center space-x-3">
                <Link href="/" className="cursor-pointer">
                  <Image
                    src="/logo-black.svg"
                    alt="Waldo"
                    width={32}
                    height={32}
                    className="h-8 w-auto hover:opacity-50 transition-opacity"
                  />
                </Link>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {/* Dashboard */}
              <Link
                href="/"
                className={`flex items-center space-x-5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${pathname === '/' ? 'text-gray-900' : 'text-gray-500'} hover:bg-gray-100`}
                onClick={() => setSidebarOpen(false)}
              >
                <LayoutDashboard
                  className={`h-5 w-5 transition-opacity ${pathname === '/' ? 'opacity-100' : 'opacity-50'}`}
                />
                <span>Dashboard</span>
              </Link>

              {/* Órdenes */}
              <Link
                href="/sales"
                className={`flex items-center space-x-5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${pathname === '/sales' ? 'text-gray-900' : 'text-gray-500'} hover:bg-gray-100`}
                onClick={() => setSidebarOpen(false)}
              >
                <ShoppingCart
                  className={`h-5 w-5 transition-opacity ${pathname === '/sales' ? 'opacity-100' : 'opacity-50'}`}
                />
                <span>Órdenes</span>
              </Link>

              {/* Anuncios Dropdown */}
              <div>
                <button
                  onClick={() => {
                    setAdsMenuOpen(!adsMenuOpen);
                    setFeaturesMenuOpen(false);
                    setReservationsMenuOpen(false);
                    setMaintainersMenuOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${pathname.startsWith('/ads') ? 'text-gray-900' : 'text-gray-500'} hover:bg-gray-100`}
                >
                  <div className="flex items-center space-x-5">
                    <FileText
                      className={`h-5 w-5 transition-opacity ${pathname.startsWith('/ads') ? 'opacity-100' : 'opacity-50'}`}
                    />
                    <span>Anuncios</span>
                  </div>
                  {adsMenuOpen ? (
                    <ChevronDown
                      className={`h-4 w-4 transition-opacity ${pathname.startsWith('/ads') ? 'opacity-100' : 'opacity-50'}`}
                    />
                  ) : (
                    <ChevronRight
                      className={`h-4 w-4 transition-opacity ${pathname.startsWith('/ads') ? 'opacity-100' : 'opacity-50'}`}
                    />
                  )}
                </button>

                {adsMenuOpen && (
                  <div className="ml-6 mt-2 space-y-0.5">
                    {adsSubMenuItems.map((subItem) => {
                      const isActive = pathname === subItem.href;
                      const Icon = subItem.icon;
                      const count = adsCounts[subItem.countKey];
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500'} hover:bg-gray-100`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {Icon && (
                            <Icon
                              className={`h-4 w-4 transition-opacity ${getOpacityClass(isActive)}`}
                            />
                          )}
                          <span>
                            {subItem.name} ({count})
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Other Menu Items */}
              {menuItems.slice(2).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                // Destacados con dropdown
                if (item.name === 'Destacados') {
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => {
                          setFeaturesMenuOpen(!featuresMenuOpen);
                          setAdsMenuOpen(false);
                          setReservationsMenuOpen(false);
                          setMaintainersMenuOpen(false);
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${pathname.startsWith('/features') ? 'text-gray-900' : 'text-gray-500'} hover:bg-gray-100`}
                      >
                        <div className="flex items-center space-x-5">
                          <Icon
                            className={`h-5 w-5 transition-opacity ${pathname.startsWith('/features') ? 'opacity-100' : 'opacity-50'}`}
                          />
                          <span>{item.name}</span>
                        </div>
                        {featuresMenuOpen ? (
                          <ChevronDown
                            className={`h-4 w-4 transition-opacity ${pathname.startsWith('/features') ? 'opacity-100' : 'opacity-50'}`}
                          />
                        ) : (
                          <ChevronRight
                            className={`h-4 w-4 transition-opacity ${pathname.startsWith('/features') ? 'opacity-100' : 'opacity-50'}`}
                          />
                        )}
                      </button>

                      {featuresMenuOpen && (
                        <div className="ml-6 mt-2 space-y-0.5">
                          {featuresSubMenuItems.map((subItem) => {
                            const isActive = pathname === subItem.href;
                            const Icon = subItem.icon;
                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500'} hover:bg-gray-100`}
                                onClick={() => setSidebarOpen(false)}
                              >
                                {Icon && (
                                  <Icon
                                    className={`h-4 w-4 transition-opacity ${getOpacityClass(isActive)}`}
                                  />
                                )}
                                <span>{subItem.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Reservas con dropdown
                if (item.name === 'Reservas') {
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => {
                          setReservationsMenuOpen(!reservationsMenuOpen);
                          setAdsMenuOpen(false);
                          setFeaturesMenuOpen(false);
                          setMaintainersMenuOpen(false);
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${pathname.startsWith('/reservations') ? 'text-gray-900' : 'text-gray-500'} hover:bg-gray-100`}
                      >
                        <div className="flex items-center space-x-5">
                          <Icon
                            className={`h-5 w-5 transition-opacity ${pathname.startsWith('/reservations') ? 'opacity-100' : 'opacity-50'}`}
                          />
                          <span>{item.name}</span>
                        </div>
                        {reservationsMenuOpen ? (
                          <ChevronDown
                            className={`h-4 w-4 transition-opacity ${pathname.startsWith('/reservations') ? 'opacity-100' : 'opacity-50'}`}
                          />
                        ) : (
                          <ChevronRight
                            className={`h-4 w-4 transition-opacity ${pathname.startsWith('/reservations') ? 'opacity-100' : 'opacity-50'}`}
                          />
                        )}
                      </button>

                      {reservationsMenuOpen && (
                        <div className="ml-6 mt-2 space-y-0.5">
                          {reservationsSubMenuItems.map((subItem) => {
                            const isActive = pathname === subItem.href;
                            const Icon = subItem.icon;
                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500'} hover:bg-gray-100`}
                                onClick={() => setSidebarOpen(false)}
                              >
                                {Icon && (
                                  <Icon
                                    className={`h-4 w-4 transition-opacity ${getOpacityClass(isActive)}`}
                                  />
                                )}
                                <span>{subItem.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Otros items normales
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500'} hover:bg-gray-100`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={`h-5 w-5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-50'}`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Mantenedores Dropdown */}
              <div>
                <button
                  onClick={() => {
                    setMaintainersMenuOpen(!maintainersMenuOpen);
                    setAdsMenuOpen(false);
                    setFeaturesMenuOpen(false);
                    setReservationsMenuOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${isMaintainersActive ? 'text-gray-900' : 'text-gray-500'} hover:bg-gray-100`}
                >
                  <div className="flex items-center space-x-5">
                    <Settings
                      className={`h-5 w-5 transition-opacity ${isMaintainersActive ? 'opacity-100' : 'opacity-50'}`}
                    />
                    <span>Mantenedores</span>
                  </div>
                  {maintainersMenuOpen ? (
                    <ChevronDown
                      className={`h-4 w-4 transition-opacity ${isMaintainersActive ? 'opacity-100' : 'opacity-50'}`}
                    />
                  ) : (
                    <ChevronRight
                      className={`h-4 w-4 transition-opacity ${isMaintainersActive ? 'opacity-100' : 'opacity-50'}`}
                    />
                  )}
                </button>

                {maintainersMenuOpen && (
                  <div className="ml-6 mt-2 space-y-0.5">
                    {maintainersSubMenuItems.map((subItem) => {
                      const isActive = pathname.startsWith(subItem.href);
                      const Icon = subItem.icon;
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-[13px] transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500'} hover:bg-gray-100`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {Icon && (
                            <Icon
                              className={`h-4 w-4 transition-opacity ${getOpacityClass(isActive)}`}
                            />
                          )}
                          <span>{subItem.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>

        {/* Main content - Full height */}
        <div className="flex-1 flex flex-col lg:ml-72 bg-gray-50 min-h-screen">
          {/* Header */}
          <Header />

          {/* Mobile header */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Link href="/" className="cursor-pointer">
                <Image
                  src="/logo-black.svg"
                  alt="Waldo"
                  width={24}
                  height={24}
                  className="h-6 w-auto hover:opacity-50 transition-opacity"
                />
              </Link>
              <div className="w-10" /> {/* Spacer for centering */}
            </div>
          </div>

          {/* Page content - Sin scroll interno */}
          <main className="flex-1 p-6 bg-gray-50 pt-24">{children}</main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </>
  );
}
