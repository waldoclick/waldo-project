'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500">Gestiona la configuración del sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuración del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500">
                Las opciones de configuración estarán disponibles próximamente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
