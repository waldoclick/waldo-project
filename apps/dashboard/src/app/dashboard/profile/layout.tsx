import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perfil - Waldo.click®',
  description: 'Gestiona tu perfil de usuario',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
