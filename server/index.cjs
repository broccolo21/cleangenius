const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Database setup
const db = new sqlite3.Database(':memory:');

// Initialize database
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Employees table
  db.run(`CREATE TABLE employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT NOT NULL,
    avatar TEXT,
    start_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Schedules table
  db.run(`CREATE TABLE schedules (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    task TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees (id)
  )`);

  // Media files table
  db.run(`CREATE TABLE media_files (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    location_lat REAL,
    location_lng REAL,
    analysis_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees (id)
  )`);

  // Reports table
  db.run(`CREATE TABLE reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    generated_by TEXT NOT NULL,
    generated_at DATETIME NOT NULL,
    data TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert demo users
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const empPassword = bcrypt.hashSync('emp123', 10);
  const clientPassword = bcrypt.hashSync('client123', 10);

  db.run(`INSERT INTO users (id, email, password, name, role) VALUES 
    ('admin-1', 'admin@example.com', ?, 'Admin User', 'admin'),
    ('emp-1', 'employee@example.com', ?, 'John Employee', 'employee'),
    ('client-1', 'client@example.com', ?, 'Client User', 'client')
  `, [hashedPassword, empPassword, clientPassword]);

  // Insert demo employees
  db.run(`INSERT INTO employees (id, name, email, role, department, status, start_date) VALUES 
    ('emp-1', 'John Employee', 'employee@example.com', 'Developer', 'Engineering', 'active', '2024-01-15'),
    ('emp-2', 'Jane Smith', 'jane@example.com', 'Designer', 'Design', 'active', '2024-02-01'),
    ('emp-3', 'Mike Johnson', 'mike@example.com', 'Manager', 'Operations', 'active', '2024-01-01')
  `);

  // Insert demo schedules
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  db.run(`INSERT INTO schedules (id, employee_id, date, start_time, end_time, task, status) VALUES 
    ('sched-1', 'emp-1', ?, '09:00', '17:00', 'Development Tasks', 'scheduled'),
    ('sched-2', 'emp-1', ?, '09:00', '17:00', 'Code Review', 'scheduled'),
    ('sched-3', 'emp-2', ?, '10:00', '18:00', 'Design Review', 'completed'),
    ('sched-4', 'emp-3', ?, '08:00', '16:00', 'Team Meeting', 'in-progress')
  `, [today, tomorrow, today, today]);
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  });
});

// Employee routes
app.get('/api/employees', authenticateToken, (req, res) => {
  db.all('SELECT * FROM employees ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/employees', authenticateToken, (req, res) => {
  const { name, email, role, department, status } = req.body;
  const id = uuidv4();
  const startDate = new Date().toISOString().split('T')[0];

  db.run(
    'INSERT INTO employees (id, name, email, role, department, status, start_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, email, role, department, status, startDate],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id, name, email, role, department, status, start_date: startDate });
    }
  );
});

app.put('/api/employees/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, email, role, department, status } = req.body;

  db.run(
    'UPDATE employees SET name = ?, email = ?, role = ?, department = ?, status = ? WHERE id = ?',
    [name, email, role, department, status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/employees/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM employees WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// Schedule routes
app.get('/api/schedules', authenticateToken, (req, res) => {
  db.all('SELECT * FROM schedules ORDER BY date DESC, start_time ASC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/schedules', authenticateToken, (req, res) => {
  const { employee_id, date, start_time, end_time, task, status } = req.body;
  const id = uuidv4();

  db.run(
    'INSERT INTO schedules (id, employee_id, date, start_time, end_time, task, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, employee_id, date, start_time, end_time, task, status],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id, employee_id, date, start_time, end_time, task, status });
    }
  );
});

app.put('/api/schedules/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(
    'UPDATE schedules SET status = ? WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    }
  );
});

// Media files routes
app.get('/api/media', authenticateToken, (req, res) => {
  db.all('SELECT * FROM media_files ORDER BY timestamp DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const mediaFiles = rows.map(row => ({
      id: row.id,
      employeeId: row.employee_id,
      filename: row.filename,
      type: row.type,
      url: row.url,
      timestamp: row.timestamp,
      location: row.location_lat && row.location_lng ? {
        lat: row.location_lat,
        lng: row.location_lng
      } : null,
      analysis: row.analysis_data ? JSON.parse(row.analysis_data) : null
    }));
    
    res.json(mediaFiles);
  });
});

app.post('/api/media', authenticateToken, (req, res) => {
  const { employeeId, filename, type, url, timestamp, location, analysis } = req.body;
  const id = uuidv4();

  db.run(
    'INSERT INTO media_files (id, employee_id, filename, type, url, timestamp, location_lat, location_lng, analysis_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id, 
      employeeId, 
      filename, 
      type, 
      url, 
      timestamp, 
      location?.lat || null, 
      location?.lng || null, 
      analysis ? JSON.stringify(analysis) : null
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ 
        id, 
        employeeId, 
        filename, 
        type, 
        url, 
        timestamp, 
        location, 
        analysis 
      });
    }
  );
});

// Reports routes
app.get('/api/reports', authenticateToken, (req, res) => {
  db.all('SELECT * FROM reports ORDER BY generated_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const reports = rows.map(row => ({
      id: row.id,
      title: row.title,
      type: row.type,
      generatedBy: row.generated_by,
      generatedAt: row.generated_at,
      data: JSON.parse(row.data),
      status: row.status
    }));
    
    res.json(reports);
  });
});

app.post('/api/reports', authenticateToken, (req, res) => {
  const { title, type, data, status } = req.body;
  const id = uuidv4();
  const generatedAt = new Date().toISOString();

  db.run(
    'INSERT INTO reports (id, title, type, generated_by, generated_at, data, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, title, type, req.user.id, generatedAt, JSON.stringify(data), status],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ 
        id, 
        title, 
        type, 
        generatedBy: req.user.id, 
        generatedAt, 
        data, 
        status 
      });
    }
  );
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});