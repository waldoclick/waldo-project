import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anuncios - Waldo.click®',
  description: 'Gestiona todos los anuncios del sistema',
};

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
