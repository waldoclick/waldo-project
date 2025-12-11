'use client';

import { useState, useEffect } from 'react';
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
import { getFaqs } from '@/lib/strapi/faqs';
import { StrapiFaq } from '@/lib/strapi/types';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePreferencesStore } from '@/stores/preferences';

export default function FaqsPage() {
  const { faqs: faqsPrefs, setFaqsPreferences } = usePreferencesStore();
  const [faqs, setFaqs] = useState<StrapiFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Cargar preferencias al montar el componente
  useEffect(() => {
    if (!isInitialized) {
      setSearchTerm(faqsPrefs.searchTerm);
      setPageSize(faqsPrefs.pageSize);
      setSortBy(faqsPrefs.sortBy);
      setIsInitialized(true);
    }
  }, [faqsPrefs, isInitialized]);

  // Guardar preferencias cuando cambien (solo después de la inicialización)
  useEffect(() => {
    if (isInitialized) {
      setFaqsPreferences({
        searchTerm,
        pageSize,
        sortBy,
      });
    }
  }, [searchTerm, pageSize, sortBy, setFaqsPreferences, isInitialized]);

  // Reset to page 1 when search term, page size, or sort changes, then fetch
  useEffect(() => {
    if (!isInitialized) return;

    setCurrentPage(1);
  }, [searchTerm, pageSize, sortBy, isInitialized]);

  // Fetch faqs when any relevant value changes
  useEffect(() => {
    // No hacer fetch hasta que las preferencias estén inicializadas
    if (!isInitialized) return;

    const fetchFaqs = async () => {
      try {
        setLoading(true);
        // Si sortBy es 'featured:desc', no enviar sort al backend y ordenar en el frontend
        const backendSort = sortBy === 'featured:desc' ? undefined : sortBy;

        const response = await getFaqs({
          page: currentPage,
          pageSize: pageSize,
          sort: backendSort,
          search: searchTerm || undefined,
        });

        let sortedFaqs = response.data;

        // Si se seleccionó "Destacadas primero", ordenar en el frontend
        if (sortBy === 'featured:desc') {
          sortedFaqs = [...response.data].sort((a, b) => {
            // Primero ordenar por destacada (true primero)
            if (a.featured !== b.featured) {
              return a.featured ? -1 : 1;
            }
            // Si ambas tienen el mismo estado de destacada, mantener el orden por fecha (más recientes primero)
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        }

        setFaqs(sortedFaqs);
        setTotalPages(response.meta.pagination.pageCount);
      } catch (error) {
        console.error('Error fetching faqs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, [currentPage, searchTerm, pageSize, sortBy, isInitialized]);

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
                className="w-64"
              />
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
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
                    >
                      Destacadas primero
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('title:asc')}>
                      Título A-Z
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('title:desc')}>
                      Título Z-A
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('createdAt:desc')}
                    >
                      Más recientes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('createdAt:asc')}
                    >
                      Más antiguos
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      {pageSize} por página
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setPageSize(5)}>
                      5 por página
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPageSize(10)}>
                      10 por página
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPageSize(25)}>
                      25 por página
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPageSize(50)}>
                      50 por página
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPageSize(100)}>
                      100 por página
                    </DropdownMenuItem>
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
