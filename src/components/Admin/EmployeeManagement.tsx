import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { Plus, Edit2, Users, Calendar, MapPin, Mail, Phone, X } from 'lucide-react';
import { Employee } from '../../types';

export function EmployeeManagement() {
  const { employees, addEmployee, updateEmployee, teams, addTeam } = useAppData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    teamId: ''
  });

  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email) {
      alert('Nome e email sono obbligatori');
      return;
    }

    const employee: Employee = {
      id: `employee-${Date.now()}`,
      name: newEmployee.name,
      email: newEmployee.email,
      role: 'employee',
      phone: newEmployee.phone,
      createdAt: new Date(),
      isActive: true,
      teamId: newEmployee.teamId || undefined,
      schedule: [],
      location: undefined
    };

    addEmployee(employee);
    setNewEmployee({ name: '', email: '', phone: '', teamId: '' });
    setShowAddModal(false);
    alert('Dipendente aggiunto con successo!');
  };

  const handleAddTeam = () => {
    if (!newTeam.name) {
      alert('Nome del team è obbligatorio');
      return;
    }

    const team = {
      id: `team-${Date.now()}`,
      name: newTeam.name,
      description: newTeam.description,
      color: newTeam.color,
      memberIds: []
    };

    addTeam(team);
    setNewTeam({ name: '', description: '', color: '#3B82F6' });
    setShowTeamModal(false);
    alert('Team creato con successo!');
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployee({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      teamId: employee.teamId || ''
    });
    setShowAddModal(true);
  };

  const handleUpdateEmployee = () => {
    if (!editingEmployee || !newEmployee.name || !newEmployee.email) {
      alert('Nome e email sono obbligatori');
      return;
    }

    updateEmployee(editingEmployee.id, {
      name: newEmployee.name,
      email: newEmployee.email,
      phone: newEmployee.phone,
      teamId: newEmployee.teamId || undefined
    });

    setEditingEmployee(null);
    setNewEmployee({ name: '', email: '', phone: '', teamId: '' });
    setShowAddModal(false);
    alert('Dipendente aggiornato con successo!');
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingEmployee(null);
    setNewEmployee({ name: '', email: '', phone: '', teamId: '' });
  };

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
                    onClick={() => handleEditEmployee(employee)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {employee.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="mr-2 h-4 w-4" />
                    <span>{employee.phone}</span>
                  </div>
                )}

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
              <button 
                onClick={() => setShowTeamModal(true)}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
              >
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

      {/* Add/Edit Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingEmployee ? 'Modifica Dipendente' : 'Aggiungi Nuovo Dipendente'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome Completo *</label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Mario Rossi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="mario@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Telefono</label>
                <input
                  type="tel"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="+39 123 456 7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Team</label>
                <select
                  value={newEmployee.teamId}
                  onChange={(e) => setNewEmployee({ ...newEmployee, teamId: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Nessun team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingEmployee ? 'Aggiorna Dipendente' : 'Aggiungi Dipendente'}
              </button>
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Crea Nuovo Team</h3>
              <button
                onClick={() => setShowTeamModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome Team *</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Squadra Manutenzione"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrizione</label>
                <textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Descrizione del team..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Colore</label>
                <div className="mt-1 flex space-x-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'].map(color => (
                    <button
                      key={color}
                      onClick={() => setNewTeam({ ...newTeam, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newTeam.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleAddTeam}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Crea Team
              </button>
              <button
                onClick={() => setShowTeamModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}