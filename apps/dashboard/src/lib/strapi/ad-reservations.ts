import { strapiClient } from './client';
import {
  StrapiAdReservation,
  StrapiAdReservationsResponse,
  StrapiFilters,
} from './types';

// Obtener todas las reservas de anuncios
export async function getAdReservations(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  filters?: StrapiFilters;
}): Promise<StrapiAdReservationsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Búsqueda por texto
  if (params?.search) {
    searchParams.append(
      'filters[$or][0][user][username][$containsi]',
      params.search
    );
    searchParams.append(
      'filters[$or][1][user][email][$containsi]',
      params.search
    );
    searchParams.append('filters[$or][2][ad][name][$containsi]', params.search);
  }

  if (params?.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      searchParams.append(`filters[${key}]`, value as string);
    });
  }

  // Populate user and ad with their related data
  searchParams.append('populate[user]', 'true');
  searchParams.append('populate[ad][populate][commune]', 'true');
  searchParams.append('populate[ad][populate][category]', 'true');
  searchParams.append('populate[ad][populate][user]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/ad-reservations${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiAdReservationsResponse>(endpoint);
}

// Obtener una reserva por ID
export async function getAdReservation(
  id: number
): Promise<{ data: StrapiAdReservation }> {
  const searchParams = new URLSearchParams();

  // Filtrar por ID
  searchParams.append('filters[id][$eq]', id.toString());

  // Populate user and ad with their related data
  searchParams.append('populate[user]', 'true');
  searchParams.append('populate[ad][populate][commune]', 'true');
  searchParams.append('populate[ad][populate][category]', 'true');
  searchParams.append('populate[ad][populate][user]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/ad-reservations${queryString ? `?${queryString}` : ''}`;

  const response =
    await strapiClient.get<StrapiAdReservationsResponse>(endpoint);

  // Retornar el primer elemento del array
  if (response.data && response.data.length > 0) {
    return { data: response.data[0] };
  } else {
    throw new Error('Reserva no encontrada');
  }
}

// Obtener reservas usadas (con anuncio asociado)
export async function getUsedReservations(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
}): Promise<StrapiAdReservationsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Búsqueda por texto
  if (params?.search) {
    searchParams.append(
      'filters[$or][0][user][username][$containsi]',
      params.search
    );
    searchParams.append(
      'filters[$or][1][user][email][$containsi]',
      params.search
    );
    searchParams.append('filters[$or][2][ad][name][$containsi]', params.search);
  }

  // Filtro para reservas con anuncio (usadas)
  searchParams.append('filters[ad][$notNull]', 'true');

  // Populate user and ad with their related data
  searchParams.append('populate[user]', 'true');
  searchParams.append('populate[ad][populate][commune]', 'true');
  searchParams.append('populate[ad][populate][category]', 'true');
  searchParams.append('populate[ad][populate][user]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/ad-reservations${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiAdReservationsResponse>(endpoint);
}

// Obtener reservas libres (sin anuncio asociado)
export async function getFreeReservations(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
}): Promise<StrapiAdReservationsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Búsqueda por texto
  if (params?.search) {
    searchParams.append(
      'filters[$or][0][user][username][$containsi]',
      params.search
    );
    searchParams.append(
      'filters[$or][1][user][email][$containsi]',
      params.search
    );
  }

  // Filtro para reservas sin anuncio (libres)
  searchParams.append('filters[ad][$null]', 'true');

  // Populate user
  searchParams.append('populate[user]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/ad-reservations${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiAdReservationsResponse>(endpoint);
}

// Obtener reservas de un usuario específico
export async function getUserReservations(
  userId: number,
  params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    search?: string;
    filters?: StrapiFilters;
  }
): Promise<StrapiAdReservationsResponse> {
  const searchParams = new URLSearchParams();

  // Paginación
  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Filtros base: usuario específico
  if (params?.search) {
    searchParams.append(
      'filters[$and][0][$or][0][ad][name][$containsi]',
      params.search
    );
    searchParams.append('filters[$and][1][user][id][$eq]', userId.toString());
  } else {
    searchParams.append('filters[user][id][$eq]', userId.toString());
  }

  // Filtros adicionales (como used/free)
  if (params?.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([operator, operatorValue]) => {
          searchParams.append(
            `filters[${key}][${operator}]`,
            operatorValue.toString()
          );
        });
      } else {
        searchParams.append(`filters[${key}]`, value.toString());
      }
    });
  }

  // Populate user and ad with their related data
  searchParams.append('populate[user]', 'true');
  searchParams.append('populate[ad][populate][commune]', 'true');
  searchParams.append('populate[ad][populate][category]', 'true');
  searchParams.append('populate[ad][populate][user]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/ad-reservations${queryString ? `?${queryString}` : ''}`;
  console.log('getUserReservations endpoint:', endpoint);

  return strapiClient.get<StrapiAdReservationsResponse>(endpoint);
}
