'use client';

import { Button } from '@/components/ui/button';
import { InputSearch } from '@/components/ui/input-search';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Plus,
  Edit,
  Eye,
  Package,
  Calendar,
  DollarSign,
  Clock,
  Star,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePacks } from '@/hooks/api';

export default function PacksPage() {
  const {
    data: packs,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    setPageSize,
    sortBy,
    setSortBy,
  } = usePacks();
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Packs de Anuncios
            </h1>
          </div>
          <Button onClick={() => router.push('/packs/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Pack
          </Button>
        </div>

        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <InputSearch
                placeholder="Buscar packs..."
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
                className="w-64"
              />
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      Ordenar por: {sortBy === 'name:asc' && 'Nombre A-Z'}
                      {sortBy === 'name:desc' && 'Nombre Z-A'}
                      {sortBy === 'price:asc' && 'Precio ascendente'}
                      {sortBy === 'price:desc' && 'Precio descendente'}
                      {sortBy === 'createdAt:desc' && 'Más recientes'}
                      {sortBy === 'createdAt:asc' && 'Más antiguos'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setSortBy('name:asc')}
                      className={sortBy === 'name:asc' ? 'bg-gray-100' : ''}
                    >
                      Nombre A-Z
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('name:desc')}
                      className={sortBy === 'name:desc' ? 'bg-gray-100' : ''}
                    >
                      Nombre Z-A
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('price:asc')}
                      className={sortBy === 'price:asc' ? 'bg-gray-100' : ''}
                    >
                      Precio ascendente
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('price:desc')}
                      className={sortBy === 'price:desc' ? 'bg-gray-100' : ''}
                    >
                      Precio descendente
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('createdAt:desc')}
                      className={
                        sortBy === 'createdAt:desc' ? 'bg-gray-100' : ''
                      }
                    >
                      Más recientes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('createdAt:asc')}
                      className={
                        sortBy === 'createdAt:asc' ? 'bg-gray-100' : ''
                      }
                    >
                      Más antiguos
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {pageSize} por página <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {[5, 10, 25, 50, 100].map((size) => (
                      <DropdownMenuItem
                        key={size}
                        onClick={() => setPageSize(size)}
                        className={pageSize === size ? 'bg-gray-100' : ''}
                      >
                        {size} por página
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4" />
                          <span>Pack</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Precio</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Duración</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Anuncios</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4" />
                          <span>Features</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Fecha de Creación</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packs.map((pack) => (
                      <TableRow key={pack.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pack.name}</div>
                            <div className="text-sm text-gray-500">
                              {pack.text}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            {formatPrice(pack.price)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span>{pack.total_days} días</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {pack.total_ads} anuncios
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span>{pack.total_features} features</span>
                        </TableCell>
                        <TableCell>
                          <span>{formatDate(pack.createdAt)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/packs/${pack.id}`)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/packs/${pack.id}/edit`)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {packs.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No se encontraron packs</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
