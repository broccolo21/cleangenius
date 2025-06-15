import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { Plus, Edit2, Users, Calendar, MapPin } from 'lucide-react';
import { Employee } from '../../types';

export function EmployeeManagement() {
  const { employees, addEmployee, updateEmployee, teams, addTeam } = useAppData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Gestione Dipendenti</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestisci dipendenti, crea team e organizza i calendari di lavoro
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Dipendente
          </button>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{employee.name}</h3>
                  <p className="text-sm text-gray-500">{employee.email}</p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => setEditingEmployee(employee)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-2 h-4 w-4" />
                  {employee.location ? (
                    <span className="text-green-600">Online - Posizione tracciata</span>
                  ) : (
                    <span className="text-gray-400">Offline</span>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{employee.schedule.length} impegni programmati</span>
                </div>

                {employee.teamId && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Team: {teams.find(t => t.id === employee.teamId)?.name || 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-2 rounded-md hover:bg-blue-100 transition-colors">
                  Modifica Calendario
                </button>
                <button className="flex-1 bg-green-50 text-green-700 text-xs font-medium px-3 py-2 rounded-md hover:bg-green-100 transition-colors">
                  Invia PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Teams Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Team</h3>
              <p className="mt-1 text-sm text-gray-600">
                Organizza i dipendenti in team per migliorare la collaborazione
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Crea Team
              </button>
            </div>
          </div>

          {teams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun team creato</h3>
              <p className="mt-1 text-sm text-gray-500">
                Inizia creando il tuo primo team
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {teams.map((team) => (
                <div key={team.id} className="border rounded-lg p-4">
                  <div className="flex items-center">
                    <div 
                      className="h-4 w-4 rounded-full mr-3"
                      style={{ backgroundColor: team.color }}
                    />
                    <h4 className="font-medium text-gray-900">{team.name}</h4>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{team.description}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    {team.memberIds.length} membri
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}