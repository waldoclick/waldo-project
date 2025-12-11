import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Usuarios',
  description: 'Gestiona todos los usuarios del sistema',
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
