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
import {
  Plus,
  Eye,
  Edit,
  Calendar,
  Star,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFaqs } from '@/hooks/api';

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

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
        <Card className="shadow-none">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      Ordenar por:{' '}
                      {sortBy === 'featured:desc' && 'Destacadas primero'}
                      {sortBy === 'title:asc' && 'Título A-Z'}
                      {sortBy === 'title:desc' && 'Título Z-A'}
                      {sortBy === 'createdAt:desc' && 'Más recientes'}
                      {sortBy === 'createdAt:asc' && 'Más antiguos'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setSortBy('featured:desc')}
                      className={
                        sortBy === 'featured:desc' ? 'bg-gray-100' : ''
                      }
                    >
                      Destacadas primero
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('title:asc')}
                      className={sortBy === 'title:asc' ? 'bg-gray-100' : ''}
                    >
                      Título A-Z
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('title:desc')}
                      className={sortBy === 'title:desc' ? 'bg-gray-100' : ''}
                    >
                      Título Z-A
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
                          <FileText className="h-4 w-4" />
                          <span>Pregunta</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4" />
                          <span>Destacada</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Texto</span>
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
