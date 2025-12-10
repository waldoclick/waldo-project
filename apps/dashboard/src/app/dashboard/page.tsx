import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Waldo.click®',
  description: 'Panel de control principal de Waldo.click®',
};

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bienvenido a tu panel de control</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Resumen
            </h3>
            <p className="text-gray-600">
              Aquí puedes ver un resumen de tu actividad
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Actividad Reciente
            </h3>
            <p className="text-gray-600">Últimas acciones en tu cuenta</p>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Configuración
            </h3>
            <p className="text-gray-600">Gestiona tu perfil y preferencias</p>
          </div>
        </div>
      </div>
    </div>
  );
}
