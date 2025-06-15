import React from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { Users, MapPin, TrendingUp, Calendar, Clock, CheckCircle } from 'lucide-react';

export function Dashboard() {
  const { employees, clients, schedule, mediaFiles } = useAppData();

  const stats = [
    {
      name: 'Dipendenti Attivi',
      value: employees.filter(e => e.isActive).length,
      total: employees.length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Clienti',
      value: clients.length,
      total: clients.length,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Impegni Oggi',
      value: schedule.filter(s => 
        new Date(s.date).toDateString() === new Date().toDateString()
      ).length,
      total: schedule.length,
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      name: 'Media Ricevuti',
      value: mediaFiles.filter(m => m.status === 'pending').length,
      total: mediaFiles.length,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Una panoramica completa delle tue operazioni aziendali
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        {stat.total !== stat.value && (
                          <div className="ml-2 text-sm text-gray-500">
                            di {stat.total}
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Map Placeholder */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Posizione Squadre in Tempo Reale
          </h3>
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Mappa Live</h3>
              <p className="mt-1 text-sm text-gray-500">
                Le posizioni dei dipendenti appariranno qui in tempo reale
              </p>
              <div className="mt-4 space-y-2">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between bg-white p-2 rounded border">
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-sm font-medium">{employee.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {employee.location ? 'Online' : 'Offline'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Attività Recenti
          </h3>
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              <li className="relative pb-8">
                <div className="relative flex space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-900">Luigi Rossi</span>
                        {' '}ha completato l'impegno presso Condominio Verde
                      </p>
                      <time className="text-xs text-gray-400">2 ore fa</time>
                    </div>
                  </div>
                </div>
              </li>
              <li className="relative pb-8">
                <div className="relative flex space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <p className="text-sm text-gray-500">
                        Nuovo impegno programmato per{' '}
                        <span className="font-medium text-gray-900">Maria Bianchi</span>
                      </p>
                      <time className="text-xs text-gray-400">4 ore fa</time>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}