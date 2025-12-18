import { strapiClient } from './client';
import { StrapiCommune, StrapiCommunesResponse, StrapiFilters } from './types';

// Tipo para actualización de comuna
interface UpdateCommuneData {
  name?: string;
  slug?: string;
  region?: number;
}

// Tipo para creación de comuna
interface CreateCommuneData {
  name: string;
  slug?: string;
  region?: number;
}

// Obtener todas las comunas
export async function getCommunes(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  filters?: StrapiFilters;
}): Promise<StrapiCommunesResponse> {
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

  // Populate región
  searchParams.append('populate[region]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/communes${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiCommunesResponse>(endpoint);
}

// Obtener una comuna por ID
export async function getCommune(id: number): Promise<{ data: StrapiCommune }> {
  const searchParams = new URLSearchParams();

  // Filtrar por ID
  searchParams.append('filters[id][$eq]', id.toString());

  // Populate región
  searchParams.append('populate[region]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/communes${queryString ? `?${queryString}` : ''}`;

  const response = await strapiClient.get<StrapiCommunesResponse>(endpoint);

  // Retornar el primer elemento del array
  if (response.data && response.data.length > 0) {
    return { data: response.data[0] };
  } else {
    throw new Error('Comuna no encontrada');
  }
}

// Crear una nueva comuna
export async function createCommune(
  data: CreateCommuneData
): Promise<{ data: StrapiCommune }> {
  return strapiClient.post<{ data: StrapiCommune }>('/communes', {
    data,
  } as unknown as Record<string, unknown>);
}

// Actualizar una comuna
export async function updateCommune(
  id: number,
  data: UpdateCommuneData
): Promise<{ data: StrapiCommune }> {
  // En Strapi v4, para actualizar usamos el ID directamente en la URL
  return strapiClient.put<{ data: StrapiCommune }>(`/communes/${id}`, {
    data,
  } as unknown as Record<string, unknown>);
}

// Eliminar una comuna
export async function deleteCommune(id: number): Promise<void> {
  return strapiClient.delete<void>(`/communes/${id}`);
}

// Obtener comunas de una región específica
export async function getRegionCommunes(
  regionId: number,
  params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
  }
): Promise<StrapiCommunesResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Filtrar por región
  searchParams.append('filters[region][id][$eq]', regionId.toString());

  // Populate región
  searchParams.append('populate[region]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/communes${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiCommunesResponse>(endpoint);
}
