import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perfil',
  description: 'Gestiona tu perfil de usuario',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
