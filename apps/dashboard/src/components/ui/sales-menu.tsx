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
  const [open, setOpen] = useState(false);
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
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors">
          <ShoppingBag className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b border-dashed border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">
            Últimas órdenes
          </h3>
          <Link
            href="/sales"
            onClick={() => setOpen(false)}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            Ver todas <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <div>
          {loading ? (
            <div className="text-sm text-gray-500 text-center py-4">
              Cargando...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              No hay órdenes
            </div>
          ) : (
            <div>
              {orders.map((order, index) => (
                <Link
                  key={order.id}
                  href={`/sales/${order.id}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between p-3 hover:bg-gray-50 transition-colors cursor-pointer ${
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
