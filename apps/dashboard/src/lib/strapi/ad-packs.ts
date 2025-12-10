import { strapiClient } from './client';
import { StrapiAdPack, StrapiAdPacksResponse, StrapiFilters } from './types';

// Obtener todos los ad packs
export async function getAdPacks(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  filters?: StrapiFilters;
}): Promise<StrapiAdPacksResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Búsqueda por texto
  if (params?.search) {
    searchParams.append('filters[$or][0][name][$containsi]', params.search);
    searchParams.append('filters[$or][1][text][$containsi]', params.search);
    searchParams.append(
      'filters[$or][2][description][$containsi]',
      params.search
    );
  }

  if (params?.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      searchParams.append(`filters[${key}]`, value as string);
    });
  }

  const queryString = searchParams.toString();
  const endpoint = `/ad-packs${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiAdPacksResponse>(endpoint);
}

// Obtener un ad pack por ID
export async function getAdPack(id: number): Promise<{ data: StrapiAdPack }> {
  const searchParams = new URLSearchParams();

  // Filtrar por ID
  searchParams.append('filters[id][$eq]', id.toString());

  const queryString = searchParams.toString();
  const endpoint = `/ad-packs${queryString ? `?${queryString}` : ''}`;

  const response = await strapiClient.get<StrapiAdPacksResponse>(endpoint);

  // Retornar el primer elemento del array
  if (response.data && response.data.length > 0) {
    return { data: response.data[0] };
  } else {
    throw new Error('Pack no encontrado');
  }
}

// Crear un nuevo ad pack
export async function createAdPack(
  data: Partial<StrapiAdPack>
): Promise<{ data: StrapiAdPack }> {
  return strapiClient.post<{ data: StrapiAdPack }>('/ad-packs', {
    data,
  } as unknown as Record<string, unknown>);
}

// Actualizar un ad pack
export async function updateAdPack(
  id: number,
  data: Partial<StrapiAdPack>
): Promise<{ data: StrapiAdPack }> {
  // En Strapi v4, para actualizar usamos el ID directamente en la URL
  return strapiClient.put<{ data: StrapiAdPack }>(`/ad-packs/${id}`, {
    data,
  } as unknown as Record<string, unknown>);
}

// Eliminar un ad pack
export async function deleteAdPack(id: number): Promise<void> {
  return strapiClient.delete<void>(`/ad-packs/${id}`);
}
