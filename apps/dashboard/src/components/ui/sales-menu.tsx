'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Circle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getOrders, StrapiOrder } from '@/lib/strapi';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function SalesMenu() {
  const [orders, setOrders] = useState<StrapiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        // Obtener las últimas 10 órdenes
        const response = await getOrders({
          page: 1,
          pageSize: 10,
          sort: 'createdAt:desc',
        });

        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  const formatCurrency = (
    amount: number | string,
    currency: string = 'CLP'
  ) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors">
          <ShoppingBag className="h-5 w-5" />
          {orders.length > 0 && (
            <span className="absolute top-0.5 right-0.5 bg-blue-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
              {orders.length > 10 ? (
                <Circle className="h-2 w-2 fill-current" />
              ) : (
                orders.length
              )}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Órdenes</h3>
          <Link
            href="/sales"
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Ver todas <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <div className="border-b border-dashed border-gray-200 -mx-4"></div>
        <div className="max-h-96 overflow-y-auto -mx-4 -my-4">
          {loading ? (
            <div className="text-sm text-gray-500 text-center py-4">
              Cargando...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              No hay órdenes
            </div>
          ) : (
            <div className="space-y-0">
              {orders.map((order, index) => (
                <Link
                  key={order.id}
                  href={`/sales/${order.id}`}
                  className={`flex items-center justify-between px-2 py-3 hover:bg-gray-50 transition-colors ${
                    index !== orders.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {order.buy_order || `Orden #${order.id}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.user?.username || order.user?.email || 'Usuario'} •{' '}
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 ml-4">
                    {formatCurrency(
                      typeof order.amount === 'string'
                        ? parseFloat(order.amount)
                        : order.amount,
                      'CLP'
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
