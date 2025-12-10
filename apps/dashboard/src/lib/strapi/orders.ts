import { strapiClient } from './client';
import { StrapiOrder, StrapiOrdersResponse, StrapiFilters } from './types';

// Obtener todas las órdenes
export async function getOrders(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  filters?: StrapiFilters;
}): Promise<StrapiOrdersResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Búsqueda por texto
  if (params?.search) {
    searchParams.append(
      'filters[$or][0][buy_order][$containsi]',
      params.search
    );
    searchParams.append(
      'filters[$or][1][user][username][$containsi]',
      params.search
    );
    searchParams.append(
      'filters[$or][2][user][email][$containsi]',
      params.search
    );
    searchParams.append('filters[$or][3][ad][name][$containsi]', params.search);
  }

  if (params?.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      searchParams.append(`filters[${key}]`, value as string);
    });
  }

  // Populate user y ad
  searchParams.append('populate[user]', 'true');
  searchParams.append('populate[ad]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiOrdersResponse>(endpoint);
}

// Obtener una orden por ID
export async function getOrder(id: number): Promise<{ data: StrapiOrder }> {
  const searchParams = new URLSearchParams();

  // Filtrar por ID
  searchParams.append('filters[id][$eq]', id.toString());

  // Populate user y ad
  searchParams.append('populate[user]', 'true');
  searchParams.append('populate[ad]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;

  const response = await strapiClient.get<StrapiOrdersResponse>(endpoint);

  // Retornar el primer elemento del array
  if (response.data && response.data.length > 0) {
    return { data: response.data[0] };
  } else {
    throw new Error('Orden no encontrada');
  }
}

// Crear una nueva orden
export async function createOrder(
  data: Partial<StrapiOrder>
): Promise<{ data: StrapiOrder }> {
  return strapiClient.post<{ data: StrapiOrder }>('/orders', {
    data,
  } as unknown as Record<string, unknown>);
}

// Actualizar una orden
export async function updateOrder(
  id: number,
  data: Partial<StrapiOrder>
): Promise<{ data: StrapiOrder }> {
  return strapiClient.put<{ data: StrapiOrder }>(`/orders/${id}`, {
    data,
  } as unknown as Record<string, unknown>);
}

// Eliminar una orden
export async function deleteOrder(id: number): Promise<void> {
  return strapiClient.delete<void>(`/orders/${id}`);
}

// Obtener órdenes de un usuario específico
export async function getUserOrders(
  userId: number,
  params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
  }
): Promise<StrapiOrdersResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Filtrar por usuario
  searchParams.append('filters[user][id][$eq]', userId.toString());

  // Populate user y ad
  searchParams.append('populate[user]', 'true');
  searchParams.append('populate[ad]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiOrdersResponse>(endpoint);
}

// Obtener órdenes relacionadas a un anuncio específico
export async function getAdOrders(
  adId: number,
  params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
  }
): Promise<StrapiOrdersResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Filtrar por anuncio
  searchParams.append('filters[ad][id][$eq]', adId.toString());

  // Populate user y ad
  searchParams.append('populate[user]', 'true');
  searchParams.append('populate[ad]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiOrdersResponse>(endpoint);
}
