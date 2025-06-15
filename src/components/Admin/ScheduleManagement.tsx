import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { Calendar, Plus, Clock, MapPin, User, Edit2, Trash2 } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';

export function ScheduleManagement() {
  const { employees, clients, schedule, addScheduleEntry } = useAppData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    employeeId: '',
    clientId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    address: '',
    description: ''
  });

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Mock schedule entries
  const mockScheduleEntries = [
    {
      id: '1',
      employeeId: 'employee-1',
      clientId: 'client-1',
      date: new Date(),
      startTime: '09:00',
      endTime: '10:30',
      location: 'Condominio Verde',
      address: 'Via Roma 123, Roma',
      description: 'Manutenzione ascensore',
      status: 'pending' as const,
    },
    {
      id: '2',
      employeeId: 'employee-2',
      clientId: 'client-2',
      date: new Date(),
      startTime: '14:00',
      endTime: '16:00',
      location: 'Condominio Rosso',
      address: 'Via Milano 456, Roma',
      description: 'Controllo impianto elettrico',
      status: 'pending' as const,
    },
    {
      id: '3',
      employeeId: 'employee-1',
      clientId: 'client-1',
      date: addDays(new Date(), 1),
      startTime: '11:00',
      endTime: '12:30',
      location: 'Condominio Verde',
      address: 'Via Roma 123, Roma',
      description: 'Pulizia filtri climatizzatore',
      status: 'pending' as const,
    },
  ];

  const handleAddSchedule = () => {
    if (!newSchedule.employeeId || !newSchedule.location) return;

    const scheduleEntry = {
      id: Date.now().toString(),
      employeeId: newSchedule.employeeId,
      date: new Date(newSchedule.date),
      startTime: newSchedule.startTime,
      endTime: newSchedule.endTime,
      location: newSchedule.location,
      address: newSchedule.address,
      description: newSchedule.description,
      status: 'pending' as const
    };

    addScheduleEntry(scheduleEntry);
    setNewSchedule({
      employeeId: '',
      clientId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      address: '',
      description: ''
    });
    setShowAddModal(false);
  };

  const getEmployeeName = (employeeId: string) => {
    return employees.find(emp => emp.id === employeeId)?.name || 'Dipendente sconosciuto';
  };

  const getClientName = (clientId: string) => {
    return clients.find(client => client.id === clientId)?.name || 'Cliente sconosciuto';
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Gestione Calendario</h1>
          <p className="mt-2 text-sm text-gray-700">
            Programma e gestisci gli impegni dei dipendenti
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Impegno
          </button>
        </div>
      </div>

      {/* Week Calendar */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Settimana del {format(weekStart, 'd MMMM yyyy', { locale: it })}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              ←
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
            >
              Oggi
            </button>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              →
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekDays.map((day) => {
            const daySchedule = mockScheduleEntries.filter(entry => 
              isSameDay(new Date(entry.date), day)
            );
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`bg-white p-4 min-h-[150px] ${
                  isToday ? 'bg-purple-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-purple-600' : 'text-gray-900'
                  }`}>
                    {format(day, 'EEE', { locale: it })}
                  </span>
                  <span className={`text-lg font-semibold ${
                    isToday ? 'text-purple-600' : 'text-gray-900'
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {daySchedule.map((entry) => (
                    <div
                      key={entry.id}
                      className="text-xs bg-purple-100 text-purple-800 p-2 rounded border-l-2 border-purple-500"
                    >
                      <div className="font-medium">{entry.startTime}</div>
                      <div className="truncate">{entry.location}</div>
                      <div className="text-purple-600">
                        {getEmployeeName(entry.employeeId)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Tutti gli Impegni</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {mockScheduleEntries.map((entry) => (
            <div key={entry.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {format(new Date(entry.date), 'dd/MM/yyyy')} - {entry.startTime} - {entry.endTime}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {getEmployeeName(entry.employeeId)}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="mt-1 text-lg font-medium text-gray-900">
                    {entry.location}
                  </h4>
                  
                  <div className="mt-1 flex items-center text-sm text-gray-600">
                    <MapPin className="mr-1 h-4 w-4" />
                    {entry.address}
                  </div>
                  
                  {entry.description && (
                    <p className="mt-2 text-sm text-gray-600">{entry.description}</p>
                  )}
                </div>
                
                <div className="ml-4 flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-500">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Nuovo Impegno</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dipendente</label>
                  <select
                    value={newSchedule.employeeId}
                    onChange={(e) => setNewSchedule({ ...newSchedule, employeeId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  >
                    <option value="">Seleziona dipendente</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente</label>
                  <select
                    value={newSchedule.clientId}
                    onChange={(e) => setNewSchedule({ ...newSchedule, clientId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  >
                    <option value="">Seleziona cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Data</label>
                <input
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ora Inizio</label>
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ora Fine</label>
                  <input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Luogo</label>
                <input
                  type="text"
                  value={newSchedule.location}
                  onChange={(e) => setNewSchedule({ ...newSchedule, location: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="Condominio Verde"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Indirizzo</label>
                <input
                  type="text"
                  value={newSchedule.address}
                  onChange={(e) => setNewSchedule({ ...newSchedule, address: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="Via Roma 123, Roma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrizione</label>
                <textarea
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="Descrizione del lavoro da svolgere..."
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleAddSchedule}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Crea Impegno
              </button>
              <button
                onClick={() => setShowAddModal(false)}
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