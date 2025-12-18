import { strapiClient } from './client';
import {
  StrapiCategory,
  StrapiCategoriesResponse,
  StrapiFilters,
} from './types';

// Obtener todas las categorías
export async function getCategories(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  filters?: StrapiFilters;
}): Promise<StrapiCategoriesResponse> {
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

  // Populate icon
  searchParams.append('populate[icon]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiCategoriesResponse>(endpoint);
}

// Obtener una categoría por ID
export async function getCategory(
  id: number
): Promise<{ data: StrapiCategory }> {
  const searchParams = new URLSearchParams();

  // Filtrar por ID
  searchParams.append('filters[id][$eq]', id.toString());

  // Populate icon
  searchParams.append('populate[icon]', 'true');

  const queryString = searchParams.toString();
  const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;

  const response = await strapiClient.get<StrapiCategoriesResponse>(endpoint);

  // Retornar el primer elemento del array
  if (response.data && response.data.length > 0) {
    return { data: response.data[0] };
  } else {
    throw new Error('Categoría no encontrada');
  }
}

// Crear una nueva categoría
export async function createCategory(data: {
  name: string;
  color?: string;
  icon?: number;
}): Promise<{ data: StrapiCategory }> {
  const payload = {
    data: {
      name: data.name,
      color: data.color,
      icon: data.icon,
    },
  };

  return strapiClient.post<{ data: StrapiCategory }>(
    '/categories',
    payload as unknown as Record<string, unknown>
  );
}

// Actualizar una categoría
export async function updateCategory(
  id: number,
  data: {
    name?: string;
    color?: string;
    icon?: number;
  }
): Promise<{ data: StrapiCategory }> {
  const payload = {
    data: {
      ...(data.name && { name: data.name }),
      ...(data.color && { color: data.color }),
      ...(data.icon && { icon: data.icon }),
    },
  };

  return strapiClient.put<{ data: StrapiCategory }>(
    `/categories/${id}`,
    payload as unknown as Record<string, unknown>
  );
}

// Eliminar una categoría
export async function deleteCategory(id: number): Promise<void> {
  return strapiClient.delete(`/categories/${id}`);
}
