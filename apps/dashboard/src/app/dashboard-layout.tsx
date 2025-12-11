'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { Header } from '@/components/ui/header';
import { Button } from '@/components/ui/button';
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
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      href: '/',
    },
    {
      name: 'Categorías',
      icon: Tag,
      href: '/categories',
    },
    {
      name: 'Condiciones',
      icon: Package,
      href: '/conditions',
    },
    {
      name: 'Destacados',
      icon: Star,
      href: '/features',
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
    {
      name: 'Reservas',
      icon: Calendar,
      href: '/reservations',
    },
    {
      name: 'Usuarios',
      icon: Users,
      href: '/users',
    },
    {
      name: 'Órdenes',
      icon: ShoppingCart,
      href: '/sales',
    },
  ];

  const adsSubMenuItems = [
    {
      name: 'Pendientes',
      href: '/ads/pending',
    },
    {
      name: 'Activos',
      href: '/ads/active',
    },
    {
      name: 'Archivados',
      href: '/ads/archived',
    },
    {
      name: 'Rechazados',
      href: '/ads/rejected',
    },
  ];

  const featuresSubMenuItems = [
    {
      name: 'Usados',
      href: '/features/used',
    },
    {
      name: 'Libres',
      href: '/features/free',
    },
  ];

  const reservationsSubMenuItems = [
    {
      name: 'Usadas',
      href: '/reservations/used',
    },
    {
      name: 'Libres',
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
                className={`flex items-center space-x-5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-gray-700 hover:bg-gray-100`}
                onClick={() => setSidebarOpen(false)}
              >
                <LayoutDashboard
                  className={`h-5 w-5 transition-opacity ${pathname === '/' ? 'opacity-100' : 'opacity-50'}`}
                />
                <span>Dashboard</span>
              </Link>

              {/* Anuncios Dropdown */}
              <div>
                <button
                  onClick={() => {
                    setAdsMenuOpen(!adsMenuOpen);
                    setFeaturesMenuOpen(false);
                    setReservationsMenuOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-gray-700 hover:bg-gray-100`}
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
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`block px-3 py-2 rounded-lg text-[13px] transition-colors text-gray-600 hover:bg-gray-100`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Other Menu Items */}
              {menuItems.slice(1).map((item) => {
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
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-gray-700 hover:bg-gray-100`}
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
                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`block px-3 py-2 rounded-lg text-[13px] transition-colors text-gray-600 hover:bg-gray-100`}
                                onClick={() => setSidebarOpen(false)}
                              >
                                {subItem.name}
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
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-gray-700 hover:bg-gray-100`}
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
                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`block px-3 py-2 rounded-lg text-[13px] transition-colors text-gray-600 hover:bg-gray-100`}
                                onClick={() => setSidebarOpen(false)}
                              >
                                {subItem.name}
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
                    className={`flex items-center space-x-5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-gray-700 hover:bg-gray-100`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={`h-5 w-5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-50'}`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content - Full height */}
        <div className="flex-1 flex flex-col lg:ml-72 bg-gray-50 min-h-screen">
          {/* Header */}
          <Header />

          {/* Mobile header */}
          <div className="lg:hidden bg-white border-b px-4 py-3">
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
          <main className="flex-1 p-6 bg-gray-50">{children}</main>
        </div>
      </div>
    </>
  );
}
