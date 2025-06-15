import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigation as NavigationIcon, MapPin, Clock, Route, Compass, Target } from 'lucide-react';

export function Navigation() {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [destination, setDestination] = useState('');

  // Mock current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Fallback to Rome coordinates
          setCurrentLocation({
            lat: 41.9028,
            lng: 12.4964
          });
        }
      );
    }
  }, []);

  // Mock upcoming appointments
  const upcomingAppointments = [
    {
      id: '1',
      time: '09:00',
      location: 'Condominio Verde',
      address: 'Via Roma 123, Roma',
      description: 'Manutenzione ascensore',
      distance: '2.3 km',
      eta: '8 min'
    },
    {
      id: '2',
      time: '11:00',
      location: 'Condominio Rosso',
      address: 'Via Milano 456, Roma',
      description: 'Controllo impianto elettrico',
      distance: '4.1 km',
      eta: '12 min'
    },
    {
      id: '3',
      time: '14:00',
      location: 'Condominio Giallo',
      address: 'Via Napoli 789, Roma',
      description: 'Pulizia filtri climatizzatore',
      distance: '1.8 km',
      eta: '6 min'
    }
  ];

  const handleNavigate = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleCustomNavigation = () => {
    if (!destination.trim()) return;
    handleNavigate(destination);
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Navigazione</h1>
          <p className="mt-2 text-sm text-gray-700">
            Naviga verso i tuoi appuntamenti e destinazioni
          </p>
        </div>
      </div>

      {/* Current Location */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Compass className="mr-2 h-5 w-5 text-blue-600" />
            Posizione Attuale
          </h3>
        </div>
        <div className="p-6">
          {currentLocation ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Posizione rilevata</p>
                  <p className="text-xs text-gray-500">
                    {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                  </p>
                </div>
              </div>
              <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          ) : (
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400 mr-3" />
              <p className="text-sm text-gray-500">Rilevamento posizione in corso...</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Target className="mr-2 h-5 w-5 text-purple-600" />
            Navigazione Personalizzata
          </h3>
        </div>
        <div className="p-6">
          <div className="flex space-x-3">
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Inserisci indirizzo di destinazione..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleCustomNavigation}
              disabled={!destination.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <NavigationIcon className="mr-2 h-4 w-4" />
              Naviga
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Clock className="mr-2 h-5 w-5 text-orange-600" />
            Prossimi Appuntamenti
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{appointment.time}</span>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {appointment.eta}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-medium text-gray-900 mb-1">
                    {appointment.location}
                  </h4>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {appointment.address}
                  </div>
                  
                  <p className="text-sm text-gray-600">{appointment.description}</p>
                  
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <Route className="h-3 w-3 mr-1" />
                    Distanza: {appointment.distance}
                  </div>
                </div>
                
                <div className="ml-4">
                  <button
                    onClick={() => handleNavigate(appointment.address)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    <NavigationIcon className="mr-2 h-4 w-4" />
                    Vai
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
          <NavigationIcon className="mr-2 h-4 w-4" />
          Suggerimenti per la Navigazione
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h5 className="font-medium mb-1">Ottimizza il Percorso</h5>
            <p>Controlla il traffico in tempo reale per scegliere la strada migliore</p>
          </div>
          <div>
            <h5 className="font-medium mb-1">Parcheggio</h5>
            <p>Cerca parcheggi nelle vicinanze prima di arrivare a destinazione</p>
          </div>
          <div>
            <h5 className="font-medium mb-1">Orari di Punta</h5>
            <p>Considera il traffico negli orari di punta per calcolare i tempi</p>
          </div>
          <div>
            <h5 className="font-medium mb-1">Backup</h5>
            <p>Tieni sempre un percorso alternativo in caso di imprevisti</p>
          </div>
        </div>
      </div>
    </div>
  );
}