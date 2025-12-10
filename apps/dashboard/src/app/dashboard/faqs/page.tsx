'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { getFaqs } from '@/lib/strapi/faqs';
import { StrapiFaq } from '@/lib/strapi/types';

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<StrapiFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getFaqs({
        page: currentPage,
        pageSize: 25,
        sort: 'createdAt:desc',
        search: searchTerm || undefined,
      });

      console.log('Faqs response:', response);
      setFaqs(response.data);
      setTotalPages(response.meta.pagination.pageCount);
    } catch (error) {
      console.error('Error fetching faqs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">FAQ</h1>
            <p className="text-gray-500">Gestiona las preguntas frecuentes</p>
          </div>
          <Button onClick={() => router.push('/dashboard/faqs/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva FAQ
          </Button>
        </div>

        {/* Tabla */}
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preguntas Frecuentes</CardTitle>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
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
                              onClick={() =>
                                router.push(`/dashboard/faqs/${faq.id}`)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/dashboard/faqs/${faq.id}/edit`)
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
