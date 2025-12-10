import { strapiClient } from './client';
import {
  StrapiCondition,
  StrapiConditionsResponse,
  StrapiFilters,
} from './types';

// Obtener todas las condiciones
export async function getConditions(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  filters?: StrapiFilters;
}): Promise<StrapiConditionsResponse> {
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

  const queryString = searchParams.toString();
  const endpoint = `/conditions${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiConditionsResponse>(endpoint);
}

// Obtener una condition por ID
export async function getCondition(
  id: number
): Promise<{ data: StrapiCondition }> {
  const searchParams = new URLSearchParams();

  // Filtrar por ID
  searchParams.append('filters[id][$eq]', id.toString());

  const queryString = searchParams.toString();
  const endpoint = `/conditions${queryString ? `?${queryString}` : ''}`;

  const response = await strapiClient.get<StrapiConditionsResponse>(endpoint);

  // Retornar el primer elemento del array
  if (response.data && response.data.length > 0) {
    return { data: response.data[0] };
  } else {
    throw new Error('Condition no encontrada');
  }
}

// Crear una nueva condition
export async function createCondition(data: {
  name: string;
}): Promise<{ data: StrapiCondition }> {
  const payload = {
    data: {
      name: data.name,
    },
  };

  return strapiClient.post<{ data: StrapiCondition }>(
    '/conditions',
    payload as unknown as Record<string, unknown>
  );
}

// Actualizar una condition
export async function updateCondition(
  id: number,
  data: {
    name?: string;
  }
): Promise<{ data: StrapiCondition }> {
  const payload = {
    data: {
      ...(data.name && { name: data.name }),
    },
  };

  return strapiClient.put<{ data: StrapiCondition }>(
    `/conditions/${id}`,
    payload as unknown as Record<string, unknown>
  );
}

// Eliminar una condition
export async function deleteCondition(id: number): Promise<void> {
  return strapiClient.delete(`/conditions/${id}`);
}
