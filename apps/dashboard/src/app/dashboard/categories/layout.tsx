import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categorías',
  description: 'Gestiona las categorías de anuncios',
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
