import { strapiClient } from './client';
import { StrapiFaq, StrapiFaqsResponse, StrapiFilters } from './types';

// Obtener todas las FAQs
export async function getFaqs(params?: {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  filters?: StrapiFilters;
}): Promise<StrapiFaqsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page)
    searchParams.append('pagination[page]', params.page.toString());
  if (params?.pageSize)
    searchParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params?.sort) searchParams.append('sort', params.sort);

  // Búsqueda por texto
  if (params?.search) {
    searchParams.append('filters[$or][0][title][$containsi]', params.search);
    searchParams.append('filters[$or][1][text][$containsi]', params.search);
  }

  if (params?.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      searchParams.append(`filters[${key}]`, value as string);
    });
  }

  const queryString = searchParams.toString();
  const endpoint = `/faqs${queryString ? `?${queryString}` : ''}`;

  return strapiClient.get<StrapiFaqsResponse>(endpoint);
}

// Obtener una FAQ por ID
export async function getFaq(id: number): Promise<{ data: StrapiFaq }> {
  const searchParams = new URLSearchParams();

  // Filtrar por ID
  searchParams.append('filters[id][$eq]', id.toString());

  const queryString = searchParams.toString();
  const endpoint = `/faqs${queryString ? `?${queryString}` : ''}`;

  const response = await strapiClient.get<StrapiFaqsResponse>(endpoint);

  // Retornar el primer elemento del array
  if (response.data && response.data.length > 0) {
    return { data: response.data[0] };
  } else {
    throw new Error('FAQ no encontrada');
  }
}

// Crear una nueva FAQ
export async function createFaq(data: {
  title: string;
  featured: boolean;
  text: string;
}): Promise<{ data: StrapiFaq }> {
  const payload = {
    data: {
      title: data.title,
      featured: data.featured,
      text: data.text,
    },
  };

  return strapiClient.post<{ data: StrapiFaq }>(
    '/faqs',
    payload as unknown as Record<string, unknown>
  );
}

// Actualizar una FAQ
export async function updateFaq(
  id: number,
  data: {
    title?: string;
    featured?: boolean;
    text?: string;
  }
): Promise<{ data: StrapiFaq }> {
  const payload = {
    data: {
      ...(data.title && { title: data.title }),
      ...(data.featured !== undefined && { featured: data.featured }),
      ...(data.text && { text: data.text }),
    },
  };

  return strapiClient.put<{ data: StrapiFaq }>(
    `/faqs/${id}`,
    payload as unknown as Record<string, unknown>
  );
}

// Eliminar una FAQ
export async function deleteFaq(id: number): Promise<void> {
  return strapiClient.delete(`/faqs/${id}`);
}
