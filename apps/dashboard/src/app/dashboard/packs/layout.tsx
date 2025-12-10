import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Packs - Waldo.click®',
  description: 'Gestiona los packs de anuncios',
};

export default function PacksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
