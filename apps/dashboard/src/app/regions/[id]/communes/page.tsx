'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Edit,
  Eye,
  MoreHorizontal,
  MapPin,
  Calendar,
  Hash,
  Plus,
  Building,
} from 'lucide-react';
import { getRegion } from '@/lib/strapi/regions';
import { getRegionCommunes } from '@/lib/strapi/communes';
import { StrapiRegion, StrapiCommune } from '@/lib/strapi/types';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

export default function RegionCommunesPage() {
  const params = useParams();
  const router = useRouter();
  const [region, setRegion] = useState<StrapiRegion | null>(null);
  const [communes, setCommunes] = useState<StrapiCommune[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const regionId = params.id as string;

  const fetchRegion = useCallback(async () => {
    try {
      const response = await getRegion(parseInt(regionId));
      setRegion(response.data);
    } catch (error) {
      console.error('Error fetching region:', error);
      alert('Error al cargar la región');
      router.push('/regions');
    }
  }, [regionId, router]);

  const fetchCommunes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRegionCommunes(parseInt(regionId), {
        page: currentPage,
        pageSize: 10,
        sort: 'name:asc',
      });

      setCommunes(response.data);
      setTotalPages(response.meta.pagination.pageCount);
      setTotalItems(response.meta.pagination.total);
    } catch (error) {
      console.error('Error fetching communes:', error);
    } finally {
      setLoading(false);
    }
  }, [regionId, currentPage]);

  useEffect(() => {
    fetchRegion();
    fetchCommunes();
  }, [fetchRegion, fetchCommunes]);

  const filteredCommunes = communes.filter(
    (commune) =>
      commune.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commune.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta comuna?')) {
      // Implementar eliminación
      console.log('Eliminar comuna:', id);
    }
  };

  if (!region) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Región no encontrada</p>
      </div>
    );
  }

  const breadcrumbsItems = [
    { label: 'Waldo', href: '/' },
    { label: 'Regiones', href: '/regions' },
    { label: region.name, href: `/regions/${region.id}` },
    { label: 'Comunas' },
  ];

  return (
    <div className="space-y-6">
      <div className="pt-4 pb-4 space-y-2">
        <Breadcrumbs items={breadcrumbsItems} />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6" style={{ color: '#313338' }} />
            <h1 className="text-[22px] font-bold" style={{ color: '#313338' }}>
              Comunas de {region.name}
            </h1>
            <p className="text-gray-500">Gestión de comunas de la región</p>
          </div>
          <Button size="header" onClick={() => router.push('/communes/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Comuna
          </Button>
        </div>
      </div>

      {/* Información de la región */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{region.name}</h2>
                <p className="text-gray-500">
                  ID: {region.id} • Slug: {region.slug}
                </p>
              </div>
            </div>
            <Badge variant="outline">{communes.length} comunas</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de comunas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Comunas</CardTitle>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Buscar comunas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
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
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4" />
                        <span>ID</span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Comuna</span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4" />
                        <span>Slug</span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>Región</span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Fecha de Creación</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right pr-6">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommunes.map((commune) => (
                    <TableRow key={commune.id}>
                      <TableCell className="pl-6">
                        <div className="font-medium">#{commune.id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{commune.name}</div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {commune.slug}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span>{commune.region?.name || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span>{formatDate(commune.createdAt)}</span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-10 w-10 p-0 cursor-pointer hover:bg-[#ffd699]"
                            >
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/communes/${commune.id}`)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/communes/${commune.id}/edit`)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(commune.id)}
                            >
                              <MoreHorizontal className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredCommunes.length === 0 && !loading && (
                <div className="text-center py-8 px-5">
                  <p className="text-gray-500">No se encontraron comunas</p>
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
  );
}
