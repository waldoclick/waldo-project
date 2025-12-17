'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { InputSearch } from '@/components/ui/input-search';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Eye, Edit, Calendar, Hash, Tag, Palette } from 'lucide-react';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { SortByData } from '@/components/ui/sort-by-data';
import { SortPerPageSize } from '@/components/ui/sort-per-page-size';
import { useCategories } from '@/hooks/api';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function CategoriesPage() {
  const {
    data: categories,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    pageSize,
    setPageSize,
    sortBy,
    setSortBy,
  } = useCategories();
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
        <div className="pt-4 pb-4 space-y-2">
          <Breadcrumbs
            items={[{ label: 'Waldo', href: '/' }, { label: 'Categorías' }]}
          />
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-7 w-7" style={{ color: '#313338' }} />
              <h1
                className="text-[28px] font-bold"
                style={{ color: '#313338' }}
              >
                Categorías
              </h1>
            </div>
            <Button
              size="header"
              onClick={() => router.push('/categories/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <InputSearch
                placeholder="Buscar categorías..."
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
          <CardContent className="px-0">
            {loading ? (
              <div className="flex items-center justify-center py-8 px-5">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">
                        <span>ID</span>
                      </TableHead>
                      <TableHead>
                        <span>Categoría</span>
                      </TableHead>
                      <TableHead>
                        <span>Slug</span>
                      </TableHead>
                      <TableHead>
                        <span>Color</span>
                      </TableHead>
                      <TableHead>
                        <span>Fecha de Creación</span>
                      </TableHead>
                      <TableHead className="text-right pr-6">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="pl-6">
                          <div className="font-medium">#{category.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{category.name}</div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {category.slug}
                          </span>
                        </TableCell>
                        <TableCell>
                          {category.color && (
                            <div className="flex items-center space-x-2">
                              <div
                                className="h-4 w-4 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="text-sm">{category.color}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatDate(category.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/categories/${category.id}`)
                              }
                              className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/categories/${category.id}/edit`)
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

                {categories.length === 0 && !loading && (
                  <div className="text-center py-8 px-5">
                    <p className="text-gray-500">
                      No se encontraron categorías
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="px-6 py-2">
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
