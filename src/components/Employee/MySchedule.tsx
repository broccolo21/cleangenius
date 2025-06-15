import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, MapPin, Navigation, CheckCircle } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, startOfDay } from 'date-fns';
import { it } from 'date-fns/locale';

export function MySchedule() {
  const { schedule } = useAppData();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock schedule entries for demo
  const mockSchedule = [
    {
      id: '1',
      employeeId: user?.id || '',
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
      employeeId: user?.id || '',
      date: new Date(),
      startTime: '11:00',
      endTime: '12:00',
      location: 'Condominio Rosso',
      address: 'Via Milano 456, Roma',
      description: 'Controllo impianto elettrico',
      status: 'pending' as const,
    },
    {
      id: '3',
      employeeId: user?.id || '',
      date: addDays(new Date(), 1),
      startTime: '14:00',
      endTime: '16:00',
      location: 'Condominio Giallo',
      address: 'Via Napoli 789, Roma',
      description: 'Pulizia filtri climatizzatore',
      status: 'pending' as const,
    },
  ];

  const todaySchedule = mockSchedule.filter(entry => 
    isSameDay(new Date(entry.date), selectedDate)
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleNavigate = (address: string) => {
    // In a real app, this would open the device's navigation app
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
  };

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">I Miei Impegni</h1>
          <p className="mt-2 text-sm text-gray-700">
            Visualizza e gestisci i tuoi impegni giornalieri e settimanali
          </p>
        </div>
      </div>

      {/* Week Calendar */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Settimana del {format(weekStart, 'd MMMM yyyy', { locale: it })}
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekDays.map((day) => {
            const daySchedule = mockSchedule.filter(entry => 
              isSameDay(new Date(entry.date), day)
            );
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`bg-white p-4 min-h-[120px] cursor-pointer hover:bg-gray-50 transition-colors ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {format(day, 'EEE', { locale: it })}
                  </span>
                  <span className={`text-lg font-semibold ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="space-y-1">
                  {daySchedule.slice(0, 2).map((entry) => (
                    <div
                      key={entry.id}
                      className="text-xs bg-blue-100 text-blue-800 p-1 rounded truncate"
                    >
                      {entry.startTime} - {entry.location}
                    </div>
                  ))}
                  {daySchedule.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{daySchedule.length - 2} altri
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Schedule */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Impegni del {format(selectedDate, 'd MMMM yyyy', { locale: it })}
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {todaySchedule.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun impegno</h3>
              <p className="mt-1 text-sm text-gray-500">
                Non hai impegni programmati per questo giorno
              </p>
            </div>
          ) : (
            todaySchedule.map((entry) => (
              <div key={entry.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {entry.startTime} - {entry.endTime}
                      </span>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.status === 'completed' ? 'bg-green-100 text-green-800' :
                        entry.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.status === 'completed' ? 'Completato' :
                         entry.status === 'in-progress' ? 'In corso' : 'Programmato'}
                      </span>
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
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    <button
                      onClick={() => handleNavigate(entry.address)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Navigation className="mr-1 h-4 w-4" />
                      Naviga
                    </button>
                    
                    {entry.status === 'pending' && (
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Completa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}