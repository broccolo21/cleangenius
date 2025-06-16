# 🧹 CleanGenius - Workforce Management System

## 🎯 Panoramica

CleanGenius è un sistema completo di gestione della forza lavoro progettato specificamente per aziende di pulizie e manutenzione. Combina tecnologie moderne come React, Node.js, SQLite e AI per offrire una soluzione completa di monitoraggio, gestione e reportistica.

## ✨ Caratteristiche Principali

### 🤖 **Analisi AI Automatica**
- **TensorFlow.js + COCO-SSD**: Riconoscimento automatico oggetti in immagini
- **Report automatici**: Generazione intelligente di report da foto/video
- **Analisi qualità**: Valutazione automatica del lavoro svolto
- **80+ categorie**: Riconoscimento di strumenti, oggetti e contesti lavorativi

### 👥 **Gestione Multi-Ruolo**
- **Admin**: Dashboard completa, gestione dipendenti, clienti, calendario
- **Dipendenti**: Calendario personale, foto/video, navigazione, monitoraggio gesti
- **Clienti**: Visualizzazione report, chat con team

### 📱 **PWA (Progressive Web App)**
- **Installabile**: Funziona come app nativa su mobile e desktop
- **Offline**: Funzionalità base disponibili senza connessione
- **Push notifications**: Notifiche in tempo reale
- **Responsive**: Ottimizzato per tutti i dispositivi

### 🎥 **Monitoraggio Avanzato**
- **MediaPipe**: Riconoscimento gesti mani in tempo reale
- **GPS tracking**: Tracciamento posizione dipendenti
- **Camera integration**: Cattura foto/video con metadati
- **Gesture validation**: Verifica procedure di pulizia corrette

### 📊 **Sistema Presenze Completo**
- **Timbrature**: Entrata/uscita con calcolo ore automatico
- **Ferie e permessi**: Gestione completa assenze
- **Report mensili**: Calcolo automatico ore lavorate
- **Export Excel**: Esportazione dati per paghe

### 💬 **Comunicazione Integrata**
- **Chat real-time**: Comunicazione tra tutti i ruoli
- **WhatsApp integration**: Condivisione report diretta
- **Notifiche**: Sistema notifiche multi-canale

## 🛠️ Stack Tecnologico

### Frontend
- **React 18** + TypeScript
- **Tailwind CSS** per styling
- **Vite** come build tool
- **PWA** con service workers
- **TensorFlow.js** per AI
- **MediaPipe** per computer vision

### Backend
- **Node.js** + Express
- **SQLite** database
- **JWT** authentication
- **Multer** file upload
- **bcryptjs** password hashing

### AI & Computer Vision
- **COCO-SSD** object detection
- **MediaPipe Hands** gesture recognition
- **TensorFlow.js** browser AI
- **Canvas API** per visualizzazioni

## 🚀 Quick Start

### Prerequisiti
- Node.js 18+
- NPM 8+

### Installazione
```bash
# Clone repository
git clone https://github.com/your-repo/cleangenius.git
cd cleangenius

# Installa dipendenze
npm install

# Configura ambiente
cp .env.example .env

# Avvia in sviluppo
npm run dev
```

### Account Demo
- **Admin**: admin@company.com / 123456
- **Dipendente**: luigi@company.com / 123456  
- **Cliente**: anna@client.com / 123456

## 📁 Struttura Progetto

```
cleangenius/
├── src/                          # Frontend React
│   ├── components/              # Componenti React
│   │   ├── Admin/              # Dashboard amministratore
│   │   ├── Employee/           # Interfaccia dipendenti
│   │   ├── Client/             # Interfaccia clienti
│   │   ├── Auth/               # Autenticazione
│   │   ├── Chat/               # Sistema chat
│   │   └── Layout/             # Layout componenti
│   ├── contexts/               # React contexts
│   ├── types/                  # TypeScript types
│   └── config/                 # Configurazioni
├── server/                      # Backend Node.js
│   ├── routes/                 # API routes
│   ├── database/               # Database setup
│   ├── middleware/             # Express middleware
│   └── uploads/                # File uploads
├── public/                     # Static assets
└── dist/                       # Build produzione
```

## 🔧 Configurazione

### Variabili Ambiente (.env)
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_PATH=./server/data/workforce.db

# JWT
JWT_SECRET=your-secret-key

# File Upload
MAX_FILE_SIZE=50MB
UPLOAD_PATH=./server/uploads

# CORS
CORS_ORIGINS=http://localhost:5173
```

## 📱 Funzionalità per Ruolo

### 👨‍💼 **Amministratore**
- **Dashboard**: Panoramica completa operazioni
- **Gestione Dipendenti**: CRUD dipendenti, team, assegnazioni
- **Gestione Clienti**: Database clienti e proprietà
- **Calendario**: Programmazione impegni e turni
- **Presenze**: Monitoraggio ore, ferie, permessi
- **Mappa Live**: Tracciamento GPS dipendenti in tempo reale
- **Media & AI**: Analisi automatica foto/video con TensorFlow.js
- **Report**: Generazione e invio report ai clienti
- **Chat**: Comunicazione con dipendenti e clienti
- **Impostazioni**: Configurazione sistema

### 👷‍♂️ **Dipendente**
- **I Miei Impegni**: Calendario personale con dettagli lavori
- **Foto & Video**: Cattura media con geolocalizzazione
- **Navigazione**: GPS integrato per raggiungere clienti
- **Monitoraggio Gesti**: Verifica procedure con MediaPipe
- **Chat**: Comunicazione con admin e clienti

### 🏢 **Cliente**
- **I Miei Report**: Visualizzazione report lavori completati
- **Media Gallery**: Foto/video dei lavori con analisi AI
- **Chat**: Comunicazione diretta con team
- **Download**: Esportazione report in PDF
- **WhatsApp**: Condivisione rapida report

## 🤖 Analisi AI

### TensorFlow.js Integration
```javascript
// Caricamento modello COCO-SSD
const model = await cocoSsd.load();

// Analisi immagine
const predictions = await model.detect(imageElement);

// Generazione report automatico
const report = generateReport(predictions);
```

### Categorie Riconosciute
- **Persone**: person, hand
- **Strumenti**: bottle, cup, scissors, knife
- **Mobili**: chair, table, couch, bed
- **Elettronica**: tv, laptop, phone
- **Veicoli**: car, truck, bus

## 🎮 MediaPipe Gesture Recognition

### Setup Gesture Monitoring
```javascript
// Inizializzazione MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

// Configurazione
hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.7
});

// Callback risultati
hands.onResults(onResults);
```

### Gesti Monitorati
- **Spraying Motion**: Movimento spruzzatura (2 dita)
- **Wiping**: Mano aperta per strofinare
- **Precision Grip**: Presa di precisione (pollice + indice)
- **Pointing**: Puntamento/direzione
- **Gripping**: Pugno chiuso per afferrare

## 📊 Database Schema

### Tabelle Principali
- **users**: Utenti (admin, dipendenti, clienti)
- **teams**: Team di lavoro
- **schedule_entries**: Calendario impegni
- **media_files**: File foto/video con analisi AI
- **attendance_records**: Presenze e timbrature
- **chat_messages**: Messaggi chat
- **reports**: Report generati
- **location_tracking**: Tracciamento GPS
- **gesture_logs**: Log monitoraggio gesti

## 🔐 Sicurezza

### Autenticazione
- **JWT tokens** con scadenza 24h
- **bcryptjs** hashing password
- **Role-based access control**
- **Rate limiting** API

### Privacy
- **Dati locali**: Database SQLite locale
- **No cloud**: Nessun dato inviato a servizi esterni
- **GDPR compliant**: Controllo completo sui dati

## 🚀 Deployment

### Sviluppo
```bash
npm run dev          # Frontend + Backend
npm run server       # Solo backend
```

### Produzione
```bash
npm run build:prod   # Build frontend
npm run start        # Avvia produzione
```

### Docker (Opzionale)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build:prod
EXPOSE 3001
CMD ["npm", "run", "server:prod"]
```

## 📈 Performance

### Ottimizzazioni
- **Code splitting**: Chunk automatici per vendor/utils
- **Image optimization**: Compressione automatica upload
- **Caching**: Service worker per risorse statiche
- **Lazy loading**: Componenti caricati on-demand
- **Bundle analysis**: Ottimizzazione dimensioni

### Metriche Target
- **First Contentful Paint**: < 2s
- **Time to Interactive**: < 3s
- **Bundle size**: < 500KB gzipped
- **Lighthouse Score**: > 90

## 🧪 Testing

### Unit Tests
```bash
npm run test         # Jest + React Testing Library
```

### E2E Tests
```bash
npm run test:e2e     # Playwright
```

### API Tests
```bash
npm run test:api     # Supertest
```

## 📚 API Documentation

### Authentication
```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
PUT  /api/auth/change-password
```

### Users
```
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Media
```
GET    /api/media
POST   /api/media/upload
PUT    /api/media/:id
POST   /api/media/:id/analyze
```

### Schedule
```
GET    /api/schedule
POST   /api/schedule
PUT    /api/schedule/:id
DELETE /api/schedule/:id
```

## 🤝 Contributing

### Development Setup
1. Fork repository
2. Create feature branch
3. Install dependencies: `npm install`
4. Start development: `npm run dev`
5. Run tests: `npm test`
6. Submit pull request

### Code Style
- **ESLint**: Linting automatico
- **Prettier**: Formatting automatico
- **TypeScript**: Type safety
- **Conventional Commits**: Commit standardizzati

## 📄 License

MIT License - vedi [LICENSE](LICENSE) per dettagli.

## 🆘 Support

### Documentazione
- [Setup Guide](docs/setup.md)
- [API Reference](docs/api.md)
- [Deployment Guide](deploy.md)

### Community
- **Issues**: GitHub Issues per bug reports
- **Discussions**: GitHub Discussions per domande
- **Wiki**: Documentazione estesa

### Commercial Support
Per supporto commerciale e personalizzazioni:
- Email: support@cleangenius.com
- Website: https://cleangenius.com

---

**🧹 CleanGenius - Il futuro della gestione workforce è qui!** ✨

Made with ❤️ by the CleanGenius Team