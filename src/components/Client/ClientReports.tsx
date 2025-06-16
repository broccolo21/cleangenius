import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { FileText, Download, Calendar, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

const ClientReports: React.FC = () => {
  const { employees, schedules, mediaFiles, reports } = useAppData();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const generateReport = (type: 'attendance' | 'performance' | 'media-analysis') => {
    const reportData = {
      attendance: {
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.status === 'active').length,
        completedTasks: schedules.filter(s => s.status === 'completed').length,
        totalTasks: schedules.length,
        attendanceRate: Math.round((schedules.filter(s => s.status === 'completed').length / schedules.length) * 100) || 0
      },
      performance: {
        averageTaskCompletion: Math.round((schedules.filter(s => s.status === 'completed').length / schedules.length) * 100) || 0,
        onTimeCompletion: Math.round(Math.random() * 100),
        employeeRatings: employees.map(emp => ({
          name: emp.name,
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          tasksCompleted: schedules.filter(s => s.employeeId === emp.id && s.status === 'completed').length
        }))
      },
      'media-analysis': {
        totalFiles: mediaFiles.length,
        imagesCount: mediaFiles.filter(f => f.type === 'image').length,
        videosCount: mediaFiles.filter(f => f.type === 'video').length,
        analyzedFiles: mediaFiles.filter(f => f.analysis).length,
        sentimentBreakdown: {
          positive: mediaFiles.filter(f => f.analysis?.sentiment === 'positive').length,
          neutral: mediaFiles.filter(f => f.analysis?.sentiment === 'neutral').length,
          negative: mediaFiles.filter(f => f.analysis?.sentiment === 'negative').length
        }
      }
    };

    return reportData[type];
  };

  const downloadReport = (reportType: string) => {
    const data = generateReport(reportType as any);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const attendanceData = generateReport('attendance');
  const performanceData = generateReport('performance');
  const mediaData = generateReport('media-analysis');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">View comprehensive reports on workforce performance</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-md p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{attendanceData.activeEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{attendanceData.attendanceRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-md p-3">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Media Files</p>
              <p className="text-2xl font-semibold text-gray-900">{mediaData.totalFiles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-orange-500 rounded-md p-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{attendanceData.completedTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Report */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Attendance Report</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Employees</span>
                <span className="text-sm font-medium">{attendanceData.totalEmployees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Employees</span>
                <span className="text-sm font-medium">{attendanceData.activeEmployees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completed Tasks</span>
                <span className="text-sm font-medium">{attendanceData.completedTasks}/{attendanceData.totalTasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Attendance Rate</span>
                <span className="text-sm font-medium">{attendanceData.attendanceRate}%</span>
              </div>
            </div>
            <button
              onClick={() => downloadReport('attendance')}
              className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* Performance Report */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Performance Report</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Task Completion</span>
                <span className="text-sm font-medium">{performanceData.averageTaskCompletion}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">On-time Completion</span>
                <span className="text-sm font-medium">{performanceData.onTimeCompletion}%</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Top Performers</span>
                <div className="mt-2 space-y-2">
                  {performanceData.employeeRatings.slice(0, 3).map((emp, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{emp.name}</span>
                      <span className="font-medium">{emp.rating}/5.0</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => downloadReport('performance')}
              className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* Media Analysis Report */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Media Analysis</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Files</span>
                <span className="text-sm font-medium">{mediaData.totalFiles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Images</span>
                <span className="text-sm font-medium">{mediaData.imagesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Videos</span>
                <span className="text-sm font-medium">{mediaData.videosCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Analyzed</span>
                <span className="text-sm font-medium">{mediaData.analyzedFiles}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Sentiment Analysis</span>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Positive</span>
                    <span className="text-green-600">{mediaData.sentimentBreakdown.positive}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Neutral</span>
                    <span className="text-gray-600">{mediaData.sentimentBreakdown.neutral}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Negative</span>
                    <span className="text-red-600">{mediaData.sentimentBreakdown.negative}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => downloadReport('media-analysis')}
              className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Reports */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Historical Reports</h3>
        </div>
        <div className="p-6">
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{report.title}</h4>
                      <p className="text-sm text-gray-600">
                        Generated on {format(new Date(report.generatedAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                    <button className="text-indigo-600 hover:text-indigo-900">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No historical reports</h3>
              <p className="mt-1 text-sm text-gray-500">
                Generated reports will appear here for download and review.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientReports;