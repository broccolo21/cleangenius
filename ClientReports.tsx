import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Download, MessageCircle, Eye, Calendar, User, Image, Video, FileText, Star } from 'lucide-react';

export function ClientReports() {
  const { mediaFiles, reports } = useAppData();
  const { user } = useAuth();
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  // Mock client reports - in a real app, these would be filtered by client ID
  const mockClientReports = [
    {
      id: 'report-1',
      clientId: user?.id || '',
      employeeId: 'employee-1',
      employeeName: 'Luigi Rossi',
      title: 'Manutenzione Ascensore - Condominio Verde',
      description: 'Controllo e manutenzione ordinaria dell\'ascensore principale',
      date: new Date('2024-01-15'),
      status: 'completed' as const,
      mediaFiles: [
        {
          id: 'media-1',
          type: 'photo' as const,
          url: 'https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=800',
          caption: 'Pannello di controllo ascensore - controllo pre-manutenzione',
          timestamp: new Date('2024-01-15T09:30:00'),
        },
        {
          id: 'media-2',
          type: 'video' as const,
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          caption: 'Test funzionamento ascensore dopo manutenzione',
          timestamp: new Date('2024-01-15T11:15:00'),
        }
      ],
      aiAnalysis: {
        summary: 'Manutenzione completata con successo. Tutti i sistemi funzionano correttamente.',
        details: [
          'Pannello elettrico verificato e funzionante',
          'Cavi e collegamenti in ottime condizioni',
          'Test di sicurezza superato',
          'Pulizia e lubrificazione completate'
        ],
        rating: 5
      }
    },
    {
      id: 'report-2',
      clientId: user?.id || '',
      employeeId: 'employee-2',
      employeeName: 'Maria Bianchi',
      title: 'Controllo Impianto Climatizzazione',
      description: 'Verifica e pulizia filtri impianto di climatizzazione',
      date: new Date('2024-01-14'),
      status: 'completed' as const,
      mediaFiles: [
        {
          id: 'media-3',
          type: 'photo' as const,
          url: 'https://images.pexels.com/photos/8092/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
          caption: 'Filtri dell\'aria prima della pulizia',
          timestamp: new Date('2024-01-14T14:00:00'),
        },
        {
          id: 'media-4',
          type: 'photo' as const,
          url: 'https://images.pexels.com/photos/159045/the-interior-of-the-repair-interior-design-159045.jpeg?auto=compress&cs=tinysrgb&w=800',
          caption: 'Filtri puliti e sostituiti',
          timestamp: new Date('2024-01-14T15:30:00'),
        }
      ],
      aiAnalysis: {
        summary: 'Pulizia e sostituzione filtri completata. Miglioramento significativo della qualità dell\'aria.',
        details: [
          'Filtri sostituiti con nuovi componenti',
          'Sistema di ventilazione ottimizzato',
          'Controllo temperatura e umidità',
          'Test finale superato'
        ],
        rating: 5
      }
    }
  ];

  const handleDownload = (mediaUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppShare = (report: any) => {
    const message = `Report: ${report.title}\nData: ${report.date.toLocaleDateString('it-IT')}\nTecnico: ${report.employeeName}\n\nDettagli: ${report.description}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const selectedMediaItem = mockClientReports
    .flatMap(report => report.mediaFiles)
    .find(media => media.id === selectedMedia);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">I Miei Report</h1>
          <p className="mt-2 text-sm text-gray-700">
            Visualizza i report dei lavori svolti presso le tue strutture
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {mockClientReports.map((report) => (
          <div key={report.id} className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
            {/* Report Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                    <p className="text-blue-100 text-sm">
                      {report.date.toLocaleDateString('it-IT', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {[...Array(report.aiAnalysis.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-300 fill-current" />
                  ))}
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div className="p-6">
              <div className="flex items-center mb-4">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Tecnico: {report.employeeName}</span>
              </div>

              <p className="text-gray-700 mb-4">{report.description}</p>

              {/* AI Analysis Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-green-800 mb-2">Riepilogo Lavoro</h4>
                <p className="text-sm text-green-700 mb-2">{report.aiAnalysis.summary}</p>
                <ul className="text-sm text-green-600 space-y-1">
                  {report.aiAnalysis.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Media Files */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Media Allegati ({report.mediaFiles.length})</h4>
                <div className="grid grid-cols-2 gap-3">
                  {report.mediaFiles.map((media) => (
                    <div
                      key={media.id}
                      className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100 hover:bg-gray-200 transition-colors"
                      onClick={() => setSelectedMedia(media.id)}
                    >
                      {media.type === 'photo' ? (
                        <img
                          src={media.url}
                          alt={media.caption}
                          className="w-full h-24 object-cover"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-800 flex items-center justify-center">
                          <Video className="h-8 w-8 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute top-2 right-2">
                        {media.type === 'photo' ? (
                          <Image className="h-4 w-4 text-white drop-shadow-lg" />
                        ) : (
                          <Video className="h-4 w-4 text-white drop-shadow-lg" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleWhatsAppShare(report)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Condividi su WhatsApp
                </button>
                <button
                  onClick={() => handleDownload(report.mediaFiles[0]?.url || '', `report-${report.id}.pdf`)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Scarica Report
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Media Viewer Modal */}
      {selectedMedia && selectedMediaItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Visualizza Media</h3>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Chiudi</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {selectedMediaItem.type === 'photo' ? (
                <img
                  src={selectedMediaItem.url}
                  alt={selectedMediaItem.caption}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
              ) : (
                <video
                  src={selectedMediaItem.url}
                  controls
                  className="w-full max-h-96 rounded-lg"
                  autoPlay
                >
                  Il tuo browser non supporta la riproduzione video.
                </video>
              )}
              
              {selectedMediaItem.caption && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedMediaItem.caption}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedMediaItem.timestamp.toLocaleString('it-IT')}
                  </p>
                </div>
              )}

              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => handleDownload(selectedMediaItem.url, `media-${selectedMediaItem.id}`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Scarica
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {mockClientReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nessun report disponibile</h3>
          <p className="mt-2 text-sm text-gray-600">
            I report dei lavori svolti appariranno qui una volta completati
          </p>
        </div>
      )}
    </div>
  );
}