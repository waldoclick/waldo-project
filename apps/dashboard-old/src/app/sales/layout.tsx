import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Órdenes',
  description: 'Gestiona las ventas y órdenes del sistema',
};

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
