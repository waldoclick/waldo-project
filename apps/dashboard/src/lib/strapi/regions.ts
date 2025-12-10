import { strapiClient } from './client';
import { StrapiRegion, StrapiRegionsResponse, StrapiFilters } from './types';

// Obtener todas las regiones
export async function getRegions(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  filters?: StrapiFilters;
}): Promise<StrapiRegionsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Búsqueda por texto
  if (params?.search) {
    searchParams.append('filters[$or][0][name][$containsi]', params.search);
    searchParams.append('filters[$or][1][slug][$containsi]', params.search);
  }

  if (params?.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      searchParams.append(`filters[${key}]`, value as string);
    });
  }

  // Populate comunas
  searchParams.append('populate[communes]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/regions${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiRegionsResponse>(endpoint);
}

// Obtener una región por ID
export async function getRegion(id: number): Promise<{ data: StrapiRegion }> {
  const searchParams = new URLSearchParams();

  // Filtrar por ID
  searchParams.append('filters[id][$eq]', id.toString());

  // Populate comunas
  searchParams.append('populate[communes]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/regions${queryString ? `?${queryString}` : ''}`;

  const response = await strapiClient.get<StrapiRegionsResponse>(endpoint);

  // Retornar el primer elemento del array
  if (response.data && response.data.length > 0) {
    return { data: response.data[0] };
  } else {
    throw new Error('Región no encontrada');
  }
}

// Crear una nueva región
export async function createRegion(
  data: Partial<StrapiRegion>
): Promise<{ data: StrapiRegion }> {
  return strapiClient.post<{ data: StrapiRegion }>('/regions', {
    data,
  } as unknown as Record<string, unknown>);
}

// Actualizar una región
export async function updateRegion(
  id: number,
  data: Partial<StrapiRegion>
): Promise<{ data: StrapiRegion }> {
  // En Strapi v4, para actualizar usamos el ID directamente en la URL
  return strapiClient.put<{ data: StrapiRegion }>(`/regions/${id}`, {
    data,
  } as unknown as Record<string, unknown>);
}

// Eliminar una región
export async function deleteRegion(id: number): Promise<void> {
  return strapiClient.delete<void>(`/regions/${id}`);
}
