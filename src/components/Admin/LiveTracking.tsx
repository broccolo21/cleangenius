import React, { useState, useEffect } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { MapPin, Navigation, Clock, User, Smartphone, Battery } from 'lucide-react';

export function LiveTracking() {
  const { employees } = useAppData();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Mock real-time location updates
  const [employeeLocations, setEmployeeLocations] = useState(
    employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      lat: emp.location?.lat || 41.9028 + (Math.random() - 0.5) * 0.1,
      lng: emp.location?.lng || 12.4964 + (Math.random() - 0.5) * 0.1,
      lastUpdate: new Date(),
      status: Math.random() > 0.3 ? 'active' : 'idle',
      battery: Math.floor(Math.random() * 100),
      speed: Math.floor(Math.random() * 50)
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setEmployeeLocations(prev => prev.map(emp => ({
        ...emp,
        lat: emp.lat + (Math.random() - 0.5) * 0.001,
        lng: emp.lng + (Math.random() - 0.5) * 0.001,
        lastUpdate: new Date(),
        battery: Math.max(0, emp.battery - Math.random() * 2),
        speed: Math.floor(Math.random() * 50)
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const selectedEmp = employeeLocations.find(emp => emp.id === selectedEmployee);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Tracciamento Live</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitora la posizione e lo stato dei dipendenti in tempo reale
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Dipendenti Online
              </h3>
              <div className="space-y-3">
                {employeeLocations.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedEmployee === emp.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`h-3 w-3 rounded-full mr-3 ${
                          emp.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                          <p className="text-xs text-gray-500">
                            {emp.lastUpdate.toLocaleTimeString('it-IT')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-xs text-gray-500">
                          <Battery className="h-3 w-3 mr-1" />
                          {emp.battery}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {emp.speed} km/h
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Mappa Live
              </h3>
              
              {/* Mock Map Interface */}
              <div className="bg-gray-100 rounded-lg h-96 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
                  {/* Mock map background */}
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 400 300">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ccc" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>
                  
                  {/* Employee markers */}
                  {employeeLocations.map((emp, index) => (
                    <div
                      key={emp.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                        selectedEmployee === emp.id ? 'z-10' : 'z-0'
                      }`}
                      style={{
                        left: `${20 + (index * 15) % 60}%`,
                        top: `${30 + (index * 20) % 40}%`
                      }}
                      onClick={() => setSelectedEmployee(emp.id)}
                    >
                      <div className={`relative ${
                        selectedEmployee === emp.id ? 'scale-125' : 'scale-100'
                      } transition-transform`}>
                        <div className={`h-8 w-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                          emp.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                          <User className="h-4 w-4 text-white" />
                        </div>
                        {selectedEmployee === emp.id && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {emp.name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute top-4 right-4 bg-white rounded-lg shadow p-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-green-500 rounded-full mr-1" />
                      <span>Attivo</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full mr-1" />
                      <span>Inattivo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Employee Details */}
      {selectedEmp && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Dettagli - {selectedEmp.name}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Posizione</p>
                    <p className="text-xs text-blue-700">
                      {selectedEmp.lat.toFixed(4)}, {selectedEmp.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Navigation className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Velocità</p>
                    <p className="text-xs text-green-700">{selectedEmp.speed} km/h</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Battery className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Batteria</p>
                    <p className="text-xs text-yellow-700">{selectedEmp.battery}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">Ultimo Aggiornamento</p>
                    <p className="text-xs text-purple-700">
                      {selectedEmp.lastUpdate.toLocaleTimeString('it-IT')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}