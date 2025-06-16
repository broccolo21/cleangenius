import React, { useState, useRef, useEffect } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { Camera, Eye, CheckCircle, Send, Bot, Image, Video, Upload, Trash2, Download, Zap, Target, Brain } from 'lucide-react';

// Declare TensorFlow globals
declare global {
  interface Window {
    tf: any;
    cocoSsd: any;
  }
}

interface DetectionResult {
  class: string;
  score: number;
  bbox: [number, number, number, number];
}

interface AnalysisReport {
  detections: DetectionResult[];
  summary: string;
  status: string;
  confidence: number;
  timestamp: Date;
}

export function MediaAnalysis() {
  const { mediaFiles, updateMediaFile } = useAppData();
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [model, setModel] = useState<any>(null);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load COCO-SSD model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('🤖 Caricamento modello COCO-SSD...');
        if (window.cocoSsd) {
          const loadedModel = await window.cocoSsd.load();
          setModel(loadedModel);
          console.log('✅ Modello COCO-SSD caricato con successo!');
        } else {
          console.error('❌ COCO-SSD non disponibile');
        }
      } catch (error) {
        console.error('❌ Errore nel caricamento del modello:', error);
      }
    };

    // Wait for scripts to load
    const checkScripts = () => {
      if (window.tf && window.cocoSsd) {
        loadModel();
      } else {
        setTimeout(checkScripts, 1000);
      }
    };

    checkScripts();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImage(imageUrl);
        setAnalysisReport(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!model || !uploadedImage || !imageRef.current || !canvasRef.current) {
      alert('Modello non caricato o immagine non disponibile');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('🔍 Avvio analisi immagine...');
      
      // Perform detection
      const predictions = await model.detect(imageRef.current);
      console.log('📊 Rilevamenti:', predictions);

      // Draw bounding boxes on canvas
      drawDetections(predictions);

      // Generate report
      const report = generateReport(predictions);
      setAnalysisReport(report);

      console.log('✅ Analisi completata!');
    } catch (error) {
      console.error('❌ Errore durante l\'analisi:', error);
      alert('Errore durante l\'analisi dell\'immagine');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const drawDetections = (predictions: DetectionResult[]) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw detections
    predictions.forEach((prediction, index) => {
      const [x, y, width, height] = prediction.bbox;
      const score = (prediction.score * 100).toFixed(1);

      // Draw bounding box
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Draw label background
      const label = `${prediction.class} (${score}%)`;
      ctx.font = '16px Arial';
      const textWidth = ctx.measureText(label).width;
      
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(x, y - 25, textWidth + 10, 25);

      // Draw label text
      ctx.fillStyle = '#000000';
      ctx.fillText(label, x + 5, y - 5);
    });
  };

  const generateReport = (predictions: DetectionResult[]): AnalysisReport => {
    const detections = predictions.filter(p => p.score > 0.5);
    const avgConfidence = detections.length > 0 
      ? detections.reduce((sum, p) => sum + p.score, 0) / detections.length 
      : 0;

    // Categorize objects for cleaning context
    const cleaningObjects = ['person', 'bottle', 'cup', 'bowl', 'spoon', 'knife', 'fork'];
    const toolObjects = ['scissors', 'hair drier', 'toothbrush'];
    const furnitureObjects = ['chair', 'couch', 'bed', 'dining table', 'toilet', 'tv', 'laptop'];
    
    const foundCleaning = detections.filter(d => cleaningObjects.includes(d.class));
    const foundTools = detections.filter(d => toolObjects.includes(d.class));
    const foundFurniture = detections.filter(d => furnitureObjects.includes(d.class));

    let summary = '';
    let status = '';

    if (detections.length === 0) {
      summary = 'Nessun oggetto rilevato con sufficiente confidenza. Immagine potrebbe essere sfocata o contenere oggetti non riconoscibili.';
      status = 'Analisi incompleta';
    } else if (foundCleaning.length > 0 || foundTools.length > 0) {
      summary = `Rilevati ${detections.length} oggetti. Area di lavoro identificata con strumenti e oggetti per la pulizia.`;
      status = 'Area di lavoro rilevata';
    } else if (foundFurniture.length > 0) {
      summary = `Rilevati ${detections.length} oggetti nell'ambiente. Area domestica/ufficio identificata.`;
      status = 'Ambiente interno rilevato';
    } else {
      summary = `Rilevati ${detections.length} oggetti generici. Contesto di lavoro da verificare manualmente.`;
      status = 'Oggetti generici rilevati';
    }

    return {
      detections,
      summary,
      status,
      confidence: avgConfidence,
      timestamp: new Date()
    };
  };

  const exportReport = () => {
    if (!analysisReport) return;

    const reportText = `
🧾 REPORT AUTOMATICO ANALISI VISIVA
📅 Data: ${analysisReport.timestamp.toLocaleString('it-IT')}
🎯 Stato: ${analysisReport.status}
📊 Confidenza Media: ${(analysisReport.confidence * 100).toFixed(1)}%

📋 OGGETTI RILEVATI:
${analysisReport.detections.map(d => 
  `• ${d.class}: ${(d.score * 100).toFixed(1)}%`
).join('\n')}

📝 RIEPILOGO:
${analysisReport.summary}

🔍 DETTAGLI TECNICI:
- Modello: COCO-SSD
- Soglia confidenza: 50%
- Oggetti totali rilevati: ${analysisReport.detections.length}
- Analisi completata con TensorFlow.js
    `.trim();

    // Create downloadable file
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-analisi-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareWhatsApp = () => {
    if (!analysisReport) return;

    const message = `🤖 *REPORT ANALISI AI*\n\n📊 *Stato:* ${analysisReport.status}\n🎯 *Confidenza:* ${(analysisReport.confidence * 100).toFixed(1)}%\n\n📋 *Oggetti rilevati:*\n${analysisReport.detections.map(d => `• ${d.class} (${(d.score * 100).toFixed(1)}%)`).join('\n')}\n\n📝 *Riepilogo:*\n${analysisReport.summary}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // Mock AI analysis function for existing media
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

      {/* TensorFlow.js Visual Analysis Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
        <div className="px-6 py-4 border-b border-purple-200">
          <h3 className="text-lg font-medium text-purple-900 flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            🤖 Analisi Visiva Automatica con TensorFlow.js
          </h3>
          <p className="mt-1 text-sm text-purple-700">
            Carica un'immagine per l'analisi automatica con il modello COCO-SSD
          </p>
        </div>
        
        <div className="p-6">
          {/* Upload Section */}
          <div className="mb-6">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-purple-500" />
                  <p className="mb-2 text-sm text-purple-500">
                    <span className="font-semibold">Clicca per caricare</span> un'immagine
                  </p>
                  <p className="text-xs text-purple-500">JPG, PNG (MAX. 10MB)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          {/* Image Preview and Analysis */}
          {uploadedImage && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Display */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Immagine Caricata</h4>
                <div className="relative">
                  <img
                    ref={imageRef}
                    src={uploadedImage}
                    alt="Uploaded for analysis"
                    className="w-full h-64 object-contain border rounded-lg bg-gray-50"
                    onLoad={() => {
                      if (canvasRef.current && imageRef.current) {
                        const canvas = canvasRef.current;
                        canvas.width = imageRef.current.naturalWidth;
                        canvas.height = imageRef.current.naturalHeight;
                      }
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-64 object-contain pointer-events-none"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={analyzeImage}
                    disabled={isAnalyzing || !model}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analizzando...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Analizza con AI
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setAnalysisReport(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Rimuovi
                  </button>
                </div>
              </div>

              {/* Analysis Results */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Risultati Analisi</h4>
                
                {!model && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      🤖 Caricamento modello COCO-SSD in corso...
                    </p>
                  </div>
                )}

                {analysisReport ? (
                  <div className="space-y-4">
                    {/* Status */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <Target className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="font-medium text-green-800">{analysisReport.status}</p>
                          <p className="text-sm text-green-600">
                            Confidenza: {(analysisReport.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detected Objects */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2">
                        📋 Oggetti Rilevati ({analysisReport.detections.length})
                      </h5>
                      <div className="space-y-1">
                        {analysisReport.detections.map((detection, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-blue-700 capitalize">{detection.class}</span>
                            <span className="text-blue-600 font-medium">
                              {(detection.score * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2">📝 Riepilogo</h5>
                      <p className="text-sm text-gray-700">{analysisReport.summary}</p>
                    </div>

                    {/* Export Actions */}
                    <div className="flex space-x-3">
                      <button
                        onClick={exportReport}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Esporta Report
                      </button>
                      
                      <button
                        onClick={shareWhatsApp}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                ) : uploadedImage && !isAnalyzing && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <Bot className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Clicca "Analizza con AI" per iniziare l'analisi automatica
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Model Status */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">🧠 Stato Modello AI</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">Modello:</span>
                <p className="text-blue-600">COCO-SSD (TensorFlow.js)</p>
              </div>
              <div>
                <span className="font-medium text-blue-700">Stato:</span>
                <p className={`${model ? 'text-green-600' : 'text-yellow-600'}`}>
                  {model ? '✅ Caricato' : '⏳ Caricamento...'}
                </p>
              </div>
              <div>
                <span className="font-medium text-blue-700">Oggetti Rilevabili:</span>
                <p className="text-blue-600">80+ categorie COCO</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Media Grid */}
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
            <h4 className="font-medium text-purple-800 mb-2">🔍 Riconoscimento Visivo</h4>
            <p className="text-purple-700">Identifica automaticamente oggetti, strumenti e contesti lavorativi con COCO-SSD</p>
          </div>
          <div>
            <h4 className="font-medium text-purple-800 mb-2">📊 Analisi Qualità</h4>
            <p className="text-purple-700">Valuta la qualità del lavoro svolto e suggerisce miglioramenti basati sui rilevamenti</p>
          </div>
          <div>
            <h4 className="font-medium text-purple-800 mb-2">📄 Report Automatici</h4>
            <p className="text-purple-700">Genera report dettagliati pronti per essere inviati ai clienti via WhatsApp</p>
          </div>
        </div>
      </div>
    </div>
  );
}