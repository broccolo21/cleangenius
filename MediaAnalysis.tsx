import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { Camera, Eye, CheckCircle, Send, Bot, Image, Video } from 'lucide-react';

export function MediaAnalysis() {
  const { mediaFiles, updateMediaFile } = useAppData();
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  // Mock AI analysis function
  const generateAIAnalysis = (mediaFile: any) => {
    const mockAnalyses = [
      {
        description: "Immagine di un ascensore con pannello di controllo aperto, mostra manutenzione in corso.",
        observations: [
          "Pannello elettrico accessibile e ben organizzato",
          "Cavi ordinati secondo normative",
          "Presenza di strumenti professionali"
        ],
        recommendations: [
          "Continuare con la manutenzione programmata",
          "Verificare tutti i collegamenti elettrici",
          "Testare il funzionamento dopo l'intervento"
        ],
        confidence: 0.92,
        tags: ["manutenzione", "ascensore", "elettrico", "sicurezza"]
      },
      {
        description: "Video che mostra il controllo dell'impianto di climatizzazione, operatore al lavoro.",
        observations: [
          "Filtri dell'aria in buone condizioni",
          "Pulizia accurata in corso",
          "Utilizzo di attrezzature appropriate"
        ],
        recommendations: [
          "Sostituire filtri se necessario",
          "Controllare livelli refrigerante",
          "Programmare prossima manutenzione"
        ],
        confidence: 0.88,
        tags: ["climatizzazione", "manutenzione", "filtri", "pulizia"]
      }
    ];

    return mockAnalyses[Math.floor(Math.random() * mockAnalyses.length)];
  };

  const handleAnalyzeMedia = (mediaId: string) => {
    const mediaFile = mediaFiles.find(m => m.id === mediaId);
    if (!mediaFile) return;

    const analysis = generateAIAnalysis(mediaFile);
    
    updateMediaFile(mediaId, {
      aiAnalysis: analysis,
      status: 'analyzed'
    });
  };

  const handleApproveMedia = (mediaId: string) => {
    updateMediaFile(mediaId, {
      status: 'approved'
    });
  };

  const handleSendToClient = (mediaId: string) => {
    updateMediaFile(mediaId, {
      status: 'sent'
    });
    alert('Report inviato al cliente con successo!');
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Media & Analisi AI</h1>
          <p className="mt-2 text-sm text-gray-700">
            Ricevi media dai dipendenti e genera report automatici con AI
          </p>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mediaFiles.length === 0 ? (
          <div className="col-span-full">
            <div className="text-center py-12">
              <Camera className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nessun media ricevuto</h3>
              <p className="mt-2 text-sm text-gray-600">
                I media inviati dai dipendenti appariranno qui
              </p>
            </div>
          </div>
        ) : (
          mediaFiles.map((media) => (
            <div
              key={media.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9">
                {media.type === 'photo' ? (
                  <img
                    src={media.url}
                    alt="Media from employee"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-900 flex items-center justify-center">
                    <Video className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {media.type === 'photo' ? (
                      <Image className="h-4 w-4 text-gray-400 mr-2" />
                    ) : (
                      <Video className="h-4 w-4 text-gray-400 mr-2" />
                    )}
                    <span className="text-sm text-gray-600">
                      {media.type === 'photo' ? 'Foto' : 'Video'}
                    </span>
                  </div>
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    media.status === 'sent' ? 'bg-green-100 text-green-800' :
                    media.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    media.status === 'analyzed' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {media.status === 'sent' ? 'Inviato' :
                     media.status === 'approved' ? 'Approvato' :
                     media.status === 'analyzed' ? 'Analizzato' : 'In attesa'}
                  </span>
                </div>

                {media.caption && (
                  <p className="text-sm text-gray-600 mb-3">{media.caption}</p>
                )}

                <div className="text-xs text-gray-500 mb-3">
                  {new Date(media.timestamp).toLocaleString('it-IT')}
                </div>

                {/* AI Analysis */}
                {media.aiAnalysis && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center mb-2">
                      <Bot className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">Analisi AI</span>
                      <span className="ml-auto text-xs text-blue-600">
                        {Math.round(media.aiAnalysis.confidence * 100)}% sicurezza
                      </span>
                    </div>
                    <p className="text-sm text-blue-800 mb-2">{media.aiAnalysis.description}</p>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-blue-900">Osservazioni:</div>
                      {media.aiAnalysis.observations.slice(0, 2).map((obs, idx) => (
                        <div key={idx} className="text-xs text-blue-700">• {obs}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  {media.status === 'pending' && (
                    <button
                      onClick={() => handleAnalyzeMedia(media.id)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Analizza
                    </button>
                  )}

                  {media.status === 'analyzed' && (
                    <button
                      onClick={() => handleApproveMedia(media.id)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Approva
                    </button>
                  )}

                  {media.status === 'approved' && (
                    <button
                      onClick={() => handleSendToClient(media.id)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="mr-1 h-3 w-3" />
                      Invia Cliente
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Analysis Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Bot className="h-6 w-6 text-purple-600 mr-3" />
          <h3 className="text-lg font-medium text-purple-900">Analisi AI Automatica</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-purple-800 mb-2">Riconoscimento Visivo</h4>
            <p className="text-purple-700">Identifica automaticamente oggetti, strumenti e contesti lavorativi</p>
          </div>
          <div>
            <h4 className="font-medium text-purple-800 mb-2">Analisi Qualità</h4>
            <p className="text-purple-700">Valuta la qualità del lavoro svolto e suggerisce miglioramenti</p>
          </div>
          <div>
            <h4 className="font-medium text-purple-800 mb-2">Report Automatici</h4>
            <p className="text-purple-700">Genera report dettagliati pronti per essere inviati ai clienti</p>
          </div>
        </div>
      </div>
    </div>
  );
}