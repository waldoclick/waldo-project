'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { InputSearch } from '@/components/ui/input-search';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Eye, Edit, Calendar, Star, FileText } from 'lucide-react';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { SortByData } from '@/components/ui/sort-by-data';
import { SortPerPageSize } from '@/components/ui/sort-per-page-size';
import { useFaqs } from '@/hooks/api';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function FaqsPage() {
  const {
    data: faqs,
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
  } = useFaqs();
  const router = useRouter();
  const { formatDate } = useFormatDate();

  const sortOptions = [
    { value: 'featured:desc', label: 'Destacadas primero' },
    { value: 'title:asc', label: 'Título A-Z' },
    { value: 'title:desc', label: 'Título Z-A' },
    { value: 'createdAt:desc', label: 'Más recientes' },
    { value: 'createdAt:asc', label: 'Más antiguos' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">FAQ</h1>
          </div>
          <Button onClick={() => router.push('/faqs/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva FAQ
          </Button>
        </div>

        {/* Tabla */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <InputSearch
                placeholder="Buscar FAQ..."
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
                        <span>Pregunta</span>
                      </TableHead>
                      <TableHead>
                        <span>Destacada</span>
                      </TableHead>
                      <TableHead>
                        <span>Texto</span>
                      </TableHead>
                      <TableHead>
                        <span>Fecha de Creación</span>
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq) => (
                      <TableRow key={faq.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{faq.title}</div>
                            <div className="text-sm text-gray-500">
                              ID: {faq.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {faq.featured ? (
                            <Badge
                              variant="default"
                              className="flex items-center space-x-1"
                            >
                              <Star className="h-3 w-3" />
                              <span>Destacada</span>
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Normal</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {faq.text.length > 100
                              ? `${faq.text.substring(0, 100)}...`
                              : faq.text}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span>{formatDate(faq.createdAt)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/faqs/${faq.id}`)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/faqs/${faq.id}/edit`)
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

                {faqs.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No se encontraron FAQ</p>
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
