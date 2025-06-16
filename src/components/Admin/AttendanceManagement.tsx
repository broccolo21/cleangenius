import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { Clock, Calendar, User, Plus, Edit2, Download, Filter, CheckCircle, XCircle, Coffee, Plane, FileText } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  status: 'present' | 'absent' | 'vacation' | 'sick' | 'permission';
  notes?: string;
  totalHours?: number;
}

export function AttendanceManagement() {
  const { employees } = useAppData();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  // Mock attendance data
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: '1',
      employeeId: 'employee-1',
      date: new Date('2024-01-15'),
      clockIn: new Date('2024-01-15T08:00:00'),
      clockOut: new Date('2024-01-15T17:00:00'),
      breakStart: new Date('2024-01-15T12:00:00'),
      breakEnd: new Date('2024-01-15T13:00:00'),
      status: 'present',
      totalHours: 8
    },
    {
      id: '2',
      employeeId: 'employee-1',
      date: new Date('2024-01-16'),
      status: 'vacation',
      notes: 'Ferie programmate'
    },
    {
      id: '3',
      employeeId: 'employee-2',
      date: new Date('2024-01-15'),
      clockIn: new Date('2024-01-15T09:00:00'),
      clockOut: new Date('2024-01-15T18:00:00'),
      status: 'present',
      totalHours: 8
    }
  ]);

  const [newRecord, setNewRecord] = useState({
    employeeId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    clockIn: '08:00',
    clockOut: '17:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    status: 'present' as const,
    notes: ''
  });

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEmployeeName = (employeeId: string) => {
    return employees.find(emp => emp.id === employeeId)?.name || 'Dipendente sconosciuto';
  };

  const calculateMonthlyHours = (employeeId: string) => {
    const records = attendanceRecords.filter(record => 
      record.employeeId === employeeId &&
      record.date >= monthStart &&
      record.date <= monthEnd &&
      record.status === 'present'
    );

    const totalHours = records.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    const workingDays = records.length;
    const vacationDays = attendanceRecords.filter(record =>
      record.employeeId === employeeId &&
      record.date >= monthStart &&
      record.date <= monthEnd &&
      record.status === 'vacation'
    ).length;
    const sickDays = attendanceRecords.filter(record =>
      record.employeeId === employeeId &&
      record.date >= monthStart &&
      record.date <= monthEnd &&
      record.status === 'sick'
    ).length;
    const permissionDays = attendanceRecords.filter(record =>
      record.employeeId === employeeId &&
      record.date >= monthStart &&
      record.date <= monthEnd &&
      record.status === 'permission'
    ).length;

    return { totalHours, workingDays, vacationDays, sickDays, permissionDays };
  };

  const handleAddRecord = () => {
    if (!newRecord.employeeId) {
      alert('Seleziona un dipendente');
      return;
    }

    let totalHours = 0;
    if (newRecord.status === 'present' && newRecord.clockIn && newRecord.clockOut) {
      const clockIn = new Date(`${newRecord.date}T${newRecord.clockIn}`);
      const clockOut = new Date(`${newRecord.date}T${newRecord.clockOut}`);
      const breakTime = newRecord.breakStart && newRecord.breakEnd ? 
        (new Date(`${newRecord.date}T${newRecord.breakEnd}`).getTime() - 
         new Date(`${newRecord.date}T${newRecord.breakStart}`).getTime()) / (1000 * 60 * 60) : 0;
      
      totalHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60) - breakTime;
    }

    const record: AttendanceRecord = {
      id: Date.now().toString(),
      employeeId: newRecord.employeeId,
      date: new Date(newRecord.date),
      clockIn: newRecord.status === 'present' ? new Date(`${newRecord.date}T${newRecord.clockIn}`) : undefined,
      clockOut: newRecord.status === 'present' ? new Date(`${newRecord.date}T${newRecord.clockOut}`) : undefined,
      breakStart: newRecord.breakStart ? new Date(`${newRecord.date}T${newRecord.breakStart}`) : undefined,
      breakEnd: newRecord.breakEnd ? new Date(`${newRecord.date}T${newRecord.breakEnd}`) : undefined,
      status: newRecord.status,
      notes: newRecord.notes,
      totalHours: totalHours > 0 ? totalHours : undefined
    };

    setAttendanceRecords(prev => [...prev, record]);
    setNewRecord({
      employeeId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      clockIn: '08:00',
      clockOut: '17:00',
      breakStart: '12:00',
      breakEnd: '13:00',
      status: 'present',
      notes: ''
    });
    setShowAddModal(false);
    alert('Presenza registrata con successo!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'vacation': return <Plane className="h-4 w-4 text-blue-500" />;
      case 'sick': return <Coffee className="h-4 w-4 text-orange-500" />;
      case 'permission': return <Clock className="h-4 w-4 text-purple-500" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'Presente';
      case 'absent': return 'Assente';
      case 'vacation': return 'Ferie';
      case 'sick': return 'Malattia';
      case 'permission': return 'Permesso';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'vacation': return 'bg-blue-100 text-blue-800';
      case 'sick': return 'bg-orange-100 text-orange-800';
      case 'permission': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const inSelectedMonth = record.date >= monthStart && record.date <= monthEnd;
    const matchesEmployee = !selectedEmployee || record.employeeId === selectedEmployee;
    return inSelectedMonth && matchesEmployee;
  });

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Gestione Presenze</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestisci timbrature, ferie, permessi e calcola automaticamente le ore mensili
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Presenza
          </button>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Mese</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  ←
                </button>
                <div className="flex-1 text-center py-2 border border-gray-300 rounded-md bg-gray-50">
                  {format(selectedMonth, 'MMMM yyyy', { locale: it })}
                </div>
                <button
                  onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  →
                </button>
              </div>
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

            <div className="flex items-end">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Download className="mr-2 h-4 w-4" />
                Esporta Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {employees.map(employee => {
          const stats = calculateMonthlyHours(employee.id);
          return (
            <div key={employee.id} className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  {employee.name}
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalHours}h</div>
                    <div className="text-sm text-gray-500">Ore Lavorate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.workingDays}</div>
                    <div className="text-sm text-gray-500">Giorni Lavorati</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.vacationDays}</div>
                    <div className="text-sm text-gray-500">Giorni Ferie</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.sickDays}</div>
                    <div className="text-sm text-gray-500">Giorni Malattia</div>
                  </div>
                </div>
                {stats.permissionDays > 0 && (
                  <div className="mt-4 text-center">
                    <div className="text-lg font-semibold text-purple-600">{stats.permissionDays} Permessi</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance Records */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Presenze ({filteredRecords.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dipendente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrata
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uscita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pausa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ore Totali
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getEmployeeName(record.employeeId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(record.date, 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.clockIn ? format(record.clockIn, 'HH:mm') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.clockOut ? format(record.clockOut, 'HH:mm') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.breakStart && record.breakEnd ? 
                      `${format(record.breakStart, 'HH:mm')}-${format(record.breakEnd, 'HH:mm')}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.totalHours ? `${record.totalHours}h` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      <span className="ml-1">{getStatusText(record.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setEditingRecord(record)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Aggiungi Presenza</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Dipendente *</label>
                <select
                  value={newRecord.employeeId}
                  onChange={(e) => setNewRecord({ ...newRecord, employeeId: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Seleziona dipendente</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Data *</label>
                <input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Stato *</label>
                <select
                  value={newRecord.status}
                  onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value as any })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="present">Presente</option>
                  <option value="absent">Assente</option>
                  <option value="vacation">Ferie</option>
                  <option value="sick">Malattia</option>
                  <option value="permission">Permesso</option>
                </select>
              </div>

              {newRecord.status === 'present' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ora Entrata</label>
                      <input
                        type="time"
                        value={newRecord.clockIn}
                        onChange={(e) => setNewRecord({ ...newRecord, clockIn: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ora Uscita</label>
                      <input
                        type="time"
                        value={newRecord.clockOut}
                        onChange={(e) => setNewRecord({ ...newRecord, clockOut: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Inizio Pausa</label>
                      <input
                        type="time"
                        value={newRecord.breakStart}
                        onChange={(e) => setNewRecord({ ...newRecord, breakStart: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fine Pausa</label>
                      <input
                        type="time"
                        value={newRecord.breakEnd}
                        onChange={(e) => setNewRecord({ ...newRecord, breakEnd: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Note</label>
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Note aggiuntive..."
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleAddRecord}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Aggiungi Presenza
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