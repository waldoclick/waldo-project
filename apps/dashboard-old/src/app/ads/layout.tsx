import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anuncios',
  description: 'Gestiona todos los anuncios del sistema',
};

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
