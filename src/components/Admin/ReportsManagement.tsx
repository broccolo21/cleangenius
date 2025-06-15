import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { FileText, Download, Send, Eye, Filter, Calendar, User, Building } from 'lucide-react';

export function ReportsManagement() {
  const { reports, employees, clients } = useAppData();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedClient, setSelectedClient] = useState('');

  // Mock reports data
  const mockReports = [
    {
      id: 'report-1',
      title: 'Manutenzione Ascensore - Gennaio 2024',
      clientId: 'client-1',
      clientName: 'Condominio Verde',
      employeeId: 'employee-1',
      employeeName: 'Luigi Rossi',
      createdAt: new Date('2024-01-15'),
      status: 'sent' as const,
      mediaCount: 5,
      description: 'Report completo della manutenzione ordinaria dell\'ascensore'
    },
    {
      id: 'report-2',
      title: 'Controllo Impianto Elettrico',
      clientId: 'client-2',
      clientName: 'Condominio Rosso',
      employeeId: 'employee-2',
      employeeName: 'Maria Bianchi',
      createdAt: new Date('2024-01-14'),
      status: 'approved' as const,
      mediaCount: 3,
      description: 'Verifica e controllo dell\'impianto elettrico condominiale'
    },
    {
      id: 'report-3',
      title: 'Pulizia Filtri Climatizzazione',
      clientId: 'client-1',
      clientName: 'Condominio Verde',
      employeeId: 'employee-1',
      employeeName: 'Luigi Rossi',
      createdAt: new Date('2024-01-13'),
      status: 'draft' as const,
      mediaCount: 2,
      description: 'Pulizia e sostituzione filtri impianto climatizzazione'
    }
  ];

  const filteredReports = mockReports.filter(report => {
    if (selectedFilter !== 'all' && report.status !== selectedFilter) return false;
    if (selectedEmployee && report.employeeId !== selectedEmployee) return false;
    if (selectedClient && report.clientId !== selectedClient) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Inviato';
      case 'approved': return 'Approvato';
      case 'draft': return 'Bozza';
      default: return 'Sconosciuto';
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Gestione Report</h1>
          <p className="mt-2 text-sm text-gray-700">
            Visualizza, gestisci e invia i report ai clienti
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtri
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stato</label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">Tutti gli stati</option>
                <option value="draft">Bozza</option>
                <option value="approved">Approvato</option>
                <option value="sent">Inviato</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dipendente</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Tutti i dipendenti</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Tutti i clienti</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Report ({filteredReports.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredReports.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun report trovato</h3>
              <p className="mt-1 text-sm text-gray-500">
                Nessun report corrisponde ai filtri selezionati
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{report.title}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Building className="mr-1 h-4 w-4" />
                        {report.clientName}
                      </div>
                      <div className="flex items-center">
                        <User className="mr-1 h-4 w-4" />
                        {report.employeeName}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {report.createdAt.toLocaleDateString('it-IT')}
                      </div>
                      <div className="flex items-center">
                        <FileText className="mr-1 h-4 w-4" />
                        {report.mediaCount} media
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex space-x-2">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <Eye className="mr-1 h-4 w-4" />
                      Visualizza
                    </button>
                    
                    {report.status === 'approved' && (
                      <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        <Send className="mr-1 h-4 w-4" />
                        Invia
                      </button>
                    )}
                    
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <Download className="mr-1 h-4 w-4" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Totale Report</p>
              <p className="text-2xl font-semibold text-gray-900">{mockReports.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Send className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inviati</p>
              <p className="text-2xl font-semibold text-gray-900">
                {mockReports.filter(r => r.status === 'sent').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approvati</p>
              <p className="text-2xl font-semibold text-gray-900">
                {mockReports.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bozze</p>
              <p className="text-2xl font-semibold text-gray-900">
                {mockReports.filter(r => r.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}