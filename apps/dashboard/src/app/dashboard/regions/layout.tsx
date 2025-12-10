import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regiones - Waldo.click®',
  description: 'Gestiona las regiones del sistema',
};

export default function RegionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
