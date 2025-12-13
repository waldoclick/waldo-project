'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { InputSearch } from '@/components/ui/input-search';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Eye,
  Edit,
  Calendar,
  Hash,
  Package,
  FileCheck,
} from 'lucide-react';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { SortByData } from '@/components/ui/sort-by-data';
import { SortPerPageSize } from '@/components/ui/sort-per-page-size';
import { useConditions } from '@/hooks/api';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function ConditionsPage() {
  const {
    data: conditions,
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
  } = useConditions();
  const router = useRouter();
  const { formatDate } = useFormatDate();

  const sortOptions = [
    { value: 'name:asc', label: 'Nombre A-Z' },
    { value: 'name:desc', label: 'Nombre Z-A' },
    { value: 'createdAt:desc', label: 'Más recientes' },
    { value: 'createdAt:asc', label: 'Más antiguos' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="h-7 w-7" style={{ color: '#313338' }} />
            <h1 className="text-[28px] font-bold" style={{ color: '#313338' }}>
              Condiciones
            </h1>
          </div>
          <Button onClick={() => router.push('/conditions/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Condición
          </Button>
        </div>

        {/* Tabla */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <InputSearch
                placeholder="Buscar condiciones..."
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
                className="w-64"
              />
              <div className="flex items-center space-x-2">
                <SortByData
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  options={sortOptions}
                />
                <SortPerPageSize
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                />
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
                        <span>Condición</span>
                      </TableHead>
                      <TableHead>
                        <span>Slug</span>
                      </TableHead>
                      <TableHead>
                        <span>Fecha de Creación</span>
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conditions.map((condition) => (
                      <TableRow key={condition.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{condition.name}</div>
                            <div className="text-sm text-gray-500">
                              ID: {condition.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {condition.slug}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span>{formatDate(condition.createdAt)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/conditions/${condition.id}`)
                              }
                              className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/conditions/${condition.id}/edit`)
                              }
                              className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {conditions.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No se encontraron condiciones
                    </p>
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
