import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Condiciones - Waldo.click®',
  description: 'Gestiona las condiciones de los anuncios',
};

export default function ConditionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
