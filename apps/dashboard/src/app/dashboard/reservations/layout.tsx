import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reservas - Waldo.click®',
  description: 'Gestiona las reservas de anuncios',
};

export default function ReservationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
