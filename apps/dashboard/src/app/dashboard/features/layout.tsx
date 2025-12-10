import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Destacados - Waldo.click®',
  description: 'Gestiona los anuncios destacados',
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
