import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Waldo.click®',
  description: 'Gestiona las preguntas frecuentes',
};

export default function FaqsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
