import { strapiClient } from './client';
import { StrapiAdsResponse, StrapiAd, StrapiFilters } from './types';

// Obtener todos los anuncios
export async function getAds(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  filters?: StrapiFilters;
  populate?: string;
}): Promise<StrapiAdsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Búsqueda por texto
  if (params?.search) {
    searchParams.append('filters[$or][0][name][$containsi]', params.search);
    searchParams.append(
      'filters[$or][1][description][$containsi]',
      params.search
    );
    searchParams.append(
      'filters[$or][2][user][username][$containsi]',
      params.search
    );
    searchParams.append(
      'filters[$or][3][user][email][$containsi]',
      params.search
    );
  }

  // Usar sintaxis más simple para populate
  if (params?.populate) {
    searchParams.append('populate', params.populate);
  }

  if (params?.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      searchParams.append(`filters[${key}]`, value as string);
    });
  }

  const queryString = searchParams.toString();
  const endpoint = `/ads${queryString ? `?${queryString}` : ''}`;

  console.log('Strapi endpoint:', endpoint);

  return strapiClient.get<StrapiAdsResponse>(endpoint);
}

// Obtener un anuncio por ID
export async function getAd(id: number): Promise<{ data: StrapiAd }> {
  const searchParams = new URLSearchParams();

  // Populate correcto para Strapi v4
  searchParams.append('populate[category]', 'true');
  searchParams.append('populate[commune]', 'true');
  searchParams.append('populate[condition]', 'true');
  searchParams.append('populate[user]', 'true');
  searchParams.append('populate[gallery]', 'true');

  // Filtrar por ID en lugar de usar la URL
  searchParams.append('filters[id][$eq]', id.toString());

  const queryString = searchParams.toString();
  const endpoint = `/ads${queryString ? `?${queryString}` : ''}`;

  const response = await strapiClient.get<StrapiAdsResponse>(endpoint);

  // Retornar el primer elemento del array
  if (response.data && response.data.length > 0) {
    return { data: response.data[0] };
  } else {
    throw new Error('Anuncio no encontrado');
  }
}

// Crear un nuevo anuncio
export async function createAd(
  data: Partial<StrapiAd>
): Promise<{ data: StrapiAd }> {
  return strapiClient.post<{ data: StrapiAd }>('/ads', {
    data,
  } as unknown as Record<string, unknown>);
}

// Actualizar un anuncio
export async function updateAd(
  id: number,
  data: Partial<StrapiAd>
): Promise<{ data: StrapiAd }> {
  return strapiClient.put<{ data: StrapiAd }>(`/ads/${id}`, {
    data,
  } as unknown as Record<string, unknown>);
}

// Eliminar un anuncio
export async function deleteAd(id: number): Promise<void> {
  return strapiClient.delete<void>(`/ads/${id}`);
}

// Obtener anuncios del usuario actual
export async function getUserAds(
  userId: number,
  params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
  }
): Promise<StrapiAdsResponse> {
  const searchParams = new URLSearchParams();

  // Paginación
  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Filtros para el usuario específico
  searchParams.append('filters[user][id][$eq]', userId.toString());

  // Populate correcto para Strapi v4
  searchParams.append('populate[category]', 'true');
  searchParams.append('populate[commune]', 'true');
  searchParams.append('populate[condition]', 'true');
  searchParams.append('populate[user]', 'true');
  searchParams.append('populate[gallery]', 'true');

  const endpoint = `/ads?${searchParams.toString()}`;
  console.log('getUserAds endpoint:', endpoint);
  return strapiClient.get<StrapiAdsResponse>(endpoint);
}

// Obtener anuncios con populate específico para Strapi v4
export async function getAdsWithPopulate(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: StrapiFilters;
}): Promise<StrapiAdsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Populate correcto para Strapi v4
  searchParams.append('populate[category]', 'true');
  searchParams.append('populate[commune]', 'true');
  searchParams.append('populate[condition]', 'true');
  searchParams.append('populate[user]', 'true');

  if (params?.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        // Para filtros complejos como { $gt: 0 }
        Object.entries(value).forEach(([operator, operatorValue]) => {
          searchParams.append(
            `filters[${key}][${operator}]`,
            operatorValue as string
          );
        });
      } else {
        // Para filtros simples
        searchParams.append(`filters[${key}]`, value as string);
      }
    });
  }

  const queryString = searchParams.toString();
  const endpoint = `/ads${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiAdsResponse>(endpoint);
}

// Aprobar un anuncio
export async function approveAd(id: number): Promise<{ data: StrapiAd }> {
  return strapiClient.put<{ data: StrapiAd }>(`/ads/${id}/approve`);
}

// Rechazar un anuncio
export async function rejectAd(id: number): Promise<{ data: StrapiAd }> {
  return strapiClient.put<{ data: StrapiAd }>(`/ads/${id}/reject`);
}

// Nuevos endpoints para estados específicos
export async function getActiveAds(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
}): Promise<StrapiAdsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Búsqueda por texto
  if (params?.search) {
    searchParams.append('filters[$or][0][name][$containsi]', params.search);
    searchParams.append(
      'filters[$or][1][description][$containsi]',
      params.search
    );
    searchParams.append(
      'filters[$or][2][user][username][$containsi]',
      params.search
    );
    searchParams.append(
      'filters[$or][3][user][email][$containsi]',
      params.search
    );
  }

  const queryString = searchParams.toString();
  const endpoint = `/ads/actives${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiAdsResponse>(endpoint);
}

export async function getPendingAds(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
}): Promise<StrapiAdsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Búsqueda por texto
  if (params?.search) {
    searchParams.append('filters[$or][0][name][$containsi]', params.search);
    searchParams.append(
      'filters[$or][1][description][$containsi]',
      params.search
    );
    searchParams.append(
      'filters[$or][2][user][username][$containsi]',
      params.search
    );
    searchParams.append(
      'filters[$or][3][user][email][$containsi]',
      params.search
    );
  }

  const queryString = searchParams.toString();
  const endpoint = `/ads/pendings${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiAdsResponse>(endpoint);
}

export async function getArchivedAds(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
}): Promise<StrapiAdsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Búsqueda por texto
  if (params?.search) {
    searchParams.append('filters[$or][0][name][$containsi]', params.search);
    searchParams.append(
      'filters[$or][1][description][$containsi]',
      params.search
    );
    searchParams.append(
      'filters[$or][2][user][username][$containsi]',
      params.search
    );
    searchParams.append(
      'filters[$or][3][user][email][$containsi]',
      params.search
    );
  }

  const queryString = searchParams.toString();
  const endpoint = `/ads/archiveds${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiAdsResponse>(endpoint);
}

export async function getRejectedAds(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
}): Promise<StrapiAdsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Búsqueda por texto
  if (params?.search) {
    searchParams.append('filters[$or][0][name][$containsi]', params.search);
    searchParams.append(
      'filters[$or][1][description][$containsi]',
      params.search
    );
    searchParams.append(
      'filters[$or][2][user][username][$containsi]',
      params.search
    );
    searchParams.append(
      'filters[$or][3][user][email][$containsi]',
      params.search
    );
  }

  const queryString = searchParams.toString();
  const endpoint = `/ads/rejecteds${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiAdsResponse>(endpoint);
}

// Obtener solo el contador de anuncios pendientes
export async function getPendingAdsCount(): Promise<number> {
  const response = await getPendingAds({ page: 1, pageSize: 1 });
  return response.meta.pagination.total;
}

// Obtener solo el contador de anuncios activos
export async function getActiveAdsCount(): Promise<number> {
  const response = await getActiveAds({ page: 1, pageSize: 1 });
  return response.meta.pagination.total;
}

// Obtener solo el contador de anuncios archivados
export async function getArchivedAdsCount(): Promise<number> {
  const response = await getArchivedAds({ page: 1, pageSize: 1 });
  return response.meta.pagination.total;
}

// Obtener solo el contador de anuncios rechazados
export async function getRejectedAdsCount(): Promise<number> {
  const response = await getRejectedAds({ page: 1, pageSize: 1 });
  return response.meta.pagination.total;
}
