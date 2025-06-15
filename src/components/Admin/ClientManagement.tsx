import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { Plus, Edit2, Building, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { Client } from '../../types';

export function ClientManagement() {
  const { clients, addClient } = useAppData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    companyName: '',
    address: '',
    phone: ''
  });

  const handleAddClient = () => {
    if (!newClient.name || !newClient.email) return;

    const client: Client = {
      id: Date.now().toString(),
      name: newClient.name,
      email: newClient.email,
      role: 'client',
      companyName: newClient.companyName,
      address: newClient.address,
      createdAt: new Date(),
      isActive: true,
    };

    addClient(client);
    setNewClient({ name: '', email: '', companyName: '', address: '', phone: '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Gestione Clienti</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestisci i clienti e le loro proprietà
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Cliente
          </button>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow border border-gray-100"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                  <p className="text-green-100 text-sm">{client.companyName}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="mr-2 h-4 w-4 text-gray-400" />
                  <span>{client.email}</span>
                </div>

                {client.address && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="mr-2 h-4 w-4 text-gray-400 mt-0.5" />
                    <span>{client.address}</span>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                  <span>Cliente dal {client.createdAt.toLocaleDateString('it-IT')}</span>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                <button className="flex-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-2 rounded-md hover:bg-blue-100 transition-colors">
                  <Edit2 className="inline mr-1 h-3 w-3" />
                  Modifica
                </button>
                <button className="flex-1 bg-green-50 text-green-700 text-xs font-medium px-3 py-2 rounded-md hover:bg-green-100 transition-colors">
                  <FileText className="inline mr-1 h-3 w-3" />
                  Report
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Aggiungi Nuovo Cliente</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome Contatto</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Nome e cognome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="email@esempio.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nome Azienda/Condominio</label>
                <input
                  type="text"
                  value={newClient.companyName}
                  onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Condominio Verde"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Indirizzo</label>
                <textarea
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Via Roma 123, Roma"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleAddClient}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Aggiungi Cliente
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