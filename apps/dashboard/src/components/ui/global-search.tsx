'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, FileText, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getOrders } from '@/lib/strapi/orders';
import { getAds } from '@/lib/strapi/ads';
import { getUsers } from '@/lib/strapi/users';
import { usePreferencesStore } from '@/stores/preferences';

interface SearchResult {
  id: number;
  type: 'order' | 'ad' | 'user';
  title: string;
  subtitle?: string;
  url: string;
}

export function GlobalSearch() {
  const { globalSearch, setGlobalSearchPreferences } = usePreferencesStore();
  const searchQuery = globalSearch.searchTerm;
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const setSearchQuery = (value: string) => {
    setGlobalSearchPreferences({ searchTerm: value });
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [ordersResponse, adsResponse, usersResponse] = await Promise.all([
          getOrders({ search: searchQuery, pageSize: 5 }),
          getAds({ search: searchQuery, pageSize: 5, populate: '*' }),
          getUsers({ search: searchQuery, pageSize: 5 }),
        ]);

        const results: SearchResult[] = [];

        // Órdenes
        ordersResponse.data?.forEach((order) => {
          results.push({
            id: order.id,
            type: 'order',
            title: order.buy_order || `Orden #${order.id}`,
            subtitle: order.ad?.name || order.user?.username,
            url: `/sales/${order.id}`,
          });
        });

        // Anuncios
        adsResponse.data?.forEach((ad) => {
          const userDisplayName =
            ad.user?.username || ad.user?.email || 'Sin usuario';
          results.push({
            id: ad.id,
            type: 'ad',
            title: ad.name,
            subtitle: userDisplayName,
            url: `/ads/${ad.id}`,
          });
        });

        // Usuarios
        usersResponse.data?.forEach((user) => {
          results.push({
            id: user.id,
            type: 'user',
            title: user.username || user.email,
            subtitle: user.email,
            url: `/users/${user.id}`,
          });
        });

        setSearchResults(results.slice(0, 10)); // Limitar a 10 resultados
        setIsSearchOpen(results.length > 0);
      } catch (error) {
        console.error('Error en búsqueda:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleResultClick = (url: string) => {
    router.push(url);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const getResultIcon = (type: 'order' | 'ad' | 'user') => {
    switch (type) {
      case 'order':
        return (
          <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-sky-100/50">
            <ShoppingCart className="h-4 w-4 text-sky-500" />
          </div>
        );
      case 'ad':
        return (
          <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-rose-100/50">
            <FileText className="h-4 w-4 text-rose-500" />
          </div>
        );
      case 'user':
        return (
          <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-violet-100/50">
            <User className="h-4 w-4 text-violet-500" />
          </div>
        );
    }
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          type="text"
          placeholder="Buscar órdenes, anuncios, usuarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchResults.length > 0) setIsSearchOpen(true);
          }}
          className="pl-9 pr-3 rounded-sm"
        />
      </div>

      {/* Dropdown de resultados */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg max-h-96 overflow-y-auto z-50">
          {isSearching ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Buscando...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((result, index) => (
                <div key={`${result.type}-${result.id}`}>
                  <button
                    onClick={() => handleResultClick(result.url)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div className="text-xs text-gray-500 truncate">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                  </button>
                  {index < searchResults.length - 1 && (
                    <div className="border-b border-gray-100 mx-4" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No se encontraron resultados
            </div>
          )}
        </div>
      )}
    </div>
  );
}
