import { strapiClient } from './client';
import {
  StrapiAdFeaturedReservation,
  StrapiAdFeaturedReservationsResponse,
  StrapiFilters,
} from './types';

// Obtener todas las reservas destacadas
export async function getAdFeaturedReservations(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  filters?: StrapiFilters;
}): Promise<StrapiAdFeaturedReservationsResponse> {
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
  const endpoint = `/ad-featured-reservations${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiAdFeaturedReservationsResponse>(endpoint);
}

// Obtener una reserva destacada por ID
export async function getAdFeaturedReservation(
  id: number
): Promise<{ data: StrapiAdFeaturedReservation }> {
  const searchParams = new URLSearchParams();

  // Filtrar por ID
  searchParams.append('filters[id][$eq]', id.toString());

  // Populate user and ad with their related data
  searchParams.append('populate[user]', 'true');
  searchParams.append('populate[ad][populate][commune]', 'true');
  searchParams.append('populate[ad][populate][category]', 'true');
  searchParams.append('populate[ad][populate][user]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/ad-featured-reservations${queryString ? `?${queryString}` : ''}`;

  const response =
    await strapiClient.get<StrapiAdFeaturedReservationsResponse>(endpoint);

  // Retornar el primer elemento del array
  if (response.data && response.data.length > 0) {
    return { data: response.data[0] };
  } else {
    throw new Error('Reserva destacada no encontrada');
  }
}

// Obtener reservas destacadas usadas (con anuncio asociado)
export async function getUsedFeaturedReservations(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
}): Promise<StrapiAdFeaturedReservationsResponse> {
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
  const endpoint = `/ad-featured-reservations${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiAdFeaturedReservationsResponse>(endpoint);
}

// Obtener reservas destacadas libres (sin anuncio asociado)
export async function getFreeFeaturedReservations(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
}): Promise<StrapiAdFeaturedReservationsResponse> {
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
  const endpoint = `/ad-featured-reservations${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiAdFeaturedReservationsResponse>(endpoint);
}

// Obtener destacados de un usuario específico
export async function getUserFeaturedReservations(
  userId: number,
  params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    search?: string;
    filters?: StrapiFilters;
  }
): Promise<StrapiAdFeaturedReservationsResponse> {
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
  const endpoint = `/ad-featured-reservations${queryString ? `?${queryString}` : ''}`;
  console.log('getUserFeaturedReservations endpoint:', endpoint);

  return strapiClient.get<StrapiAdFeaturedReservationsResponse>(endpoint);
}
