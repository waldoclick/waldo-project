import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Órdenes - Waldo.click®',
  description: 'Gestiona las ventas y órdenes del sistema',
};

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
