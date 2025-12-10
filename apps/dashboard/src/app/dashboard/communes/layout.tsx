import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comunas - Waldo.click®',
  description: 'Gestiona las comunas del sistema',
};

export default function CommunesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
