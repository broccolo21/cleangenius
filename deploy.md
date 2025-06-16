# 🚀 Guida Deployment Produzione - CleanGenius

## 📋 Prerequisiti

### Server Requirements
- **Node.js**: v18+ 
- **NPM**: v8+
- **Sistema Operativo**: Linux/Ubuntu (consigliato) o Windows Server
- **RAM**: Minimo 2GB, consigliato 4GB+
- **Storage**: Minimo 10GB liberi
- **Porte**: 3001 (backend), 80/443 (web)

### Servizi Cloud Consigliati
- **VPS**: DigitalOcean, Linode, AWS EC2, Google Cloud
- **Hosting**: Vercel, Netlify (solo frontend), Railway
- **Database**: SQLite (incluso) o PostgreSQL per scale maggiori

## 🛠️ Setup Locale (Test Produzione)

### 1. Preparazione Ambiente
```bash
# Naviga nella cartella del progetto
cd /path/to/Cleangenius

# Installa dipendenze
npm install

# Copia file ambiente
cp .env.example .env
cp .env.production .env.production

# Modifica le variabili di produzione
nano .env.production
```

### 2. Configurazione Database
```bash
# Crea cartelle necessarie
mkdir -p server/data
mkdir -p server/uploads
mkdir -p logs

# Imposta permessi (Linux/Mac)
chmod 755 server/data
chmod 755 server/uploads
chmod 755 logs
```

### 3. Build e Test Locale
```bash
# Build frontend per produzione
npm run build:prod

# Test server produzione locale
npm run start

# Verifica su: http://localhost:3001
```

## 🌐 Deployment su VPS (DigitalOcean/AWS)

### 1. Setup Server Ubuntu
```bash
# Connetti al server
ssh root@your-server-ip

# Aggiorna sistema
apt update && apt upgrade -y

# Installa Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Installa PM2 (Process Manager)
npm install -g pm2

# Installa Nginx (Reverse Proxy)
apt install nginx -y

# Installa Certbot (SSL)
apt install certbot python3-certbot-nginx -y
```

### 2. Upload Codice
```bash
# Opzione A: Git Clone
git clone https://github.com/your-repo/cleangenius.git
cd cleangenius

# Opzione B: Upload via SCP
scp -r /path/to/Cleangenius root@your-server-ip:/var/www/
```

### 3. Configurazione Applicazione
```bash
# Installa dipendenze
npm install --production

# Configura ambiente produzione
cp .env.production .env

# Modifica variabili
nano .env
# Cambia:
# - JWT_SECRET (genera una chiave sicura)
# - FRONTEND_URL (il tuo dominio)
# - CORS_ORIGINS (il tuo dominio)

# Build frontend
npm run build:prod

# Test avvio
npm run server:prod
```

### 4. Configurazione PM2
```bash
# Crea file ecosystem
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'cleangenius',
    script: 'server/index.cjs',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Avvia con PM2
pm2 start ecosystem.config.js --env production

# Salva configurazione PM2
pm2 save
pm2 startup
```

### 5. Configurazione Nginx
```bash
# Crea configurazione sito
cat > /etc/nginx/sites-available/cleangenius << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration (will be added by Certbot)
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files
    location /uploads/ {
        proxy_pass http://localhost:3001;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Frontend (React app)
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Abilita sito
ln -s /etc/nginx/sites-available/cleangenius /etc/nginx/sites-enabled/

# Test configurazione
nginx -t

# Riavvia Nginx
systemctl restart nginx
```

### 6. Setup SSL (HTTPS)
```bash
# Ottieni certificato SSL gratuito
certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
certbot renew --dry-run
```

## 🔧 Deployment Alternativo (Railway/Vercel)

### Railway (Full-Stack)
```bash
# Installa Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Vercel (Solo Frontend + API Routes)
```bash
# Installa Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configura variabili ambiente su dashboard Vercel
```

## 📊 Monitoraggio e Manutenzione

### 1. Comandi PM2 Utili
```bash
# Status applicazioni
pm2 status

# Logs in tempo reale
pm2 logs cleangenius

# Restart applicazione
pm2 restart cleangenius

# Stop applicazione
pm2 stop cleangenius

# Monitoring dashboard
pm2 monit
```

### 2. Backup Database
```bash
# Backup manuale
cp server/data/workforce.db backups/workforce_$(date +%Y%m%d_%H%M%S).db

# Script backup automatico
cat > backup.sh << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/cleangenius"
mkdir -p \$BACKUP_DIR
cp server/data/workforce.db \$BACKUP_DIR/workforce_\$(date +%Y%m%d_%H%M%S).db
find \$BACKUP_DIR -name "workforce_*.db" -mtime +30 -delete
EOF

chmod +x backup.sh

# Aggiungi a crontab (backup giornaliero)
echo "0 2 * * * /path/to/cleangenius/backup.sh" | crontab -
```

### 3. Aggiornamenti
```bash
# Pull nuove modifiche
git pull origin main

# Installa nuove dipendenze
npm install

# Rebuild frontend
npm run build:prod

# Restart applicazione
pm2 restart cleangenius
```

## 🔒 Sicurezza

### 1. Firewall
```bash
# Configura UFW
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

### 2. Variabili Ambiente Sicure
```bash
# Genera JWT secret sicuro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Aggiorna .env con chiavi sicure
```

### 3. Aggiornamenti Sistema
```bash
# Setup aggiornamenti automatici
apt install unattended-upgrades
dpkg-reconfigure unattended-upgrades
```

## 🚨 Troubleshooting

### Problemi Comuni
1. **Porta 3001 occupata**: `lsof -i :3001` e `kill -9 PID`
2. **Permessi file**: `chown -R www-data:www-data /path/to/app`
3. **Memoria insufficiente**: Aumenta swap o RAM
4. **SSL non funziona**: Verifica DNS e firewall

### Logs Utili
```bash
# Logs applicazione
pm2 logs cleangenius

# Logs Nginx
tail -f /var/log/nginx/error.log

# Logs sistema
journalctl -u nginx -f
```

## 📞 Supporto

Per problemi di deployment:
1. Controlla logs applicazione e server
2. Verifica configurazione DNS
3. Testa connettività porte
4. Controlla variabili ambiente

**🎯 Il tuo CleanGenius è ora pronto per la produzione!** 🚀