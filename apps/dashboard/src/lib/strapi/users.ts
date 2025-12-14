import { strapiClient } from './client';
import { StrapiUser, StrapiFilters } from './types';

// Interfaz para respuesta de usuarios
export interface StrapiUsersResponse {
  data: StrapiUser[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Obtener todos los usuarios
export async function getUsers(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  filters?: StrapiFilters;
}): Promise<StrapiUsersResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Popular las relaciones necesarias para contar
  searchParams.append('populate[role]', 'true');
  searchParams.append('populate[ads]', 'true');
  searchParams.append('populate[ad_reservations][populate][ad]', 'true');
  searchParams.append(
    'populate[ad_featured_reservations][populate][ad]',
    'true'
  );

  // Filtrar solo usuarios con rol Authenticated
  // Si hay búsqueda, combinamos con $and
  if (params?.search) {
    searchParams.append('filters[$and][0][role][name][$eq]', 'Authenticated');
    searchParams.append(
      'filters[$and][1][$or][0][username][$containsi]',
      params.search
    );
    searchParams.append(
      'filters[$and][1][$or][1][email][$containsi]',
      params.search
    );
  } else {
    searchParams.append('filters[role][name][$eq]', 'Authenticated');
  }

  if (params?.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      searchParams.append(`filters[${key}]`, String(value));
    });
  }

  const queryString = searchParams.toString();
  const endpoint = `/users${queryString ? `?${queryString}` : ''}`;

  const response = await strapiClient.get<StrapiUser[]>(endpoint);

  // Strapi devuelve un array directo de usuarios, no un objeto con data y meta
  return {
    data: response,
    meta: {
      pagination: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 25,
        pageCount: Math.ceil(response.length / (params?.pageSize || 25)),
        total: response.length,
      },
    },
  };
}

// Obtener un usuario por ID
export async function getUser(id: number): Promise<{ data: StrapiUser }> {
  const searchParams = new URLSearchParams();

  // Filtrar por ID
  searchParams.append('filters[id][$eq]', id.toString());

  // Popular toda la data del usuario
  searchParams.append('populate', '*');

  const queryString = searchParams.toString();
  const endpoint = `/users${queryString ? `?${queryString}` : ''}`;

  const response = await strapiClient.get<StrapiUser[]>(endpoint);

  // Retornar el primer elemento del array
  if (response && response.length > 0) {
    return { data: response[0] };
  } else {
    throw new Error('Usuario no encontrado');
  }
}

// Crear un nuevo usuario
export async function createUser(
  data: Partial<StrapiUser>
): Promise<{ data: StrapiUser }> {
  return strapiClient.post<{ data: StrapiUser }>('/users', {
    data,
  } as unknown as Record<string, unknown>);
}

// Actualizar un usuario
export async function updateUser(
  id: number,
  data: Partial<StrapiUser>
): Promise<{ data: StrapiUser }> {
  return strapiClient.put<{ data: StrapiUser }>(`/users/${id}`, {
    data,
  } as unknown as Record<string, unknown>);
}

// Eliminar un usuario
export async function deleteUser(id: number): Promise<void> {
  return strapiClient.delete<void>(`/users/${id}`);
}
