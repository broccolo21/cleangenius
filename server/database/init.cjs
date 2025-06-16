const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../data/workforce.db');

// Create database connection
function createConnection() {
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database');
    }
  });
}

// Initialize database with tables and seed data
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = createConnection();
    
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    
    // Create tables
    const createTables = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'employee', 'client')) NOT NULL,
        avatar TEXT,
        phone TEXT,
        company_name TEXT,
        address TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Teams table
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#3B82F6',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Team members junction table
      CREATE TABLE IF NOT EXISTS team_members (
        team_id TEXT,
        user_id TEXT,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (team_id, user_id),
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Schedule entries table
      CREATE TABLE IF NOT EXISTS schedule_entries (
        id TEXT PRIMARY KEY,
        employee_id TEXT NOT NULL,
        client_id TEXT,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        location TEXT NOT NULL,
        address TEXT NOT NULL,
        description TEXT,
        status TEXT CHECK(status IN ('pending', 'in-progress', 'completed', 'cancelled')) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL
      );

      -- Media files table
      CREATE TABLE IF NOT EXISTS media_files (
        id TEXT PRIMARY KEY,
        employee_id TEXT NOT NULL,
        schedule_entry_id TEXT,
        type TEXT CHECK(type IN ('photo', 'video')) NOT NULL,
        filename TEXT NOT NULL,
        original_name TEXT,
        url TEXT NOT NULL,
        caption TEXT,
        file_size INTEGER,
        mime_type TEXT,
        status TEXT CHECK(status IN ('pending', 'analyzed', 'approved', 'sent')) DEFAULT 'pending',
        ai_analysis TEXT, -- JSON string
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (schedule_entry_id) REFERENCES schedule_entries(id) ON DELETE SET NULL
      );

      -- Location tracking table
      CREATE TABLE IF NOT EXISTS location_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        accuracy REAL,
        speed REAL,
        heading REAL,
        battery_level INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Chat messages table
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        recipient_id TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT CHECK(type IN ('text', 'image', 'file')) DEFAULT 'text',
        file_url TEXT,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Reports table
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        status TEXT CHECK(status IN ('draft', 'approved', 'sent')) DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        sent_at DATETIME,
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Report media junction table
      CREATE TABLE IF NOT EXISTS report_media (
        report_id TEXT,
        media_id TEXT,
        PRIMARY KEY (report_id, media_id),
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
        FOREIGN KEY (media_id) REFERENCES media_files(id) ON DELETE CASCADE
      );

      -- Gesture monitoring table
      CREATE TABLE IF NOT EXISTS gesture_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT NOT NULL,
        schedule_entry_id TEXT,
        gesture_type TEXT NOT NULL,
        confidence REAL,
        is_correct BOOLEAN,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (schedule_entry_id) REFERENCES schedule_entries(id) ON DELETE SET NULL
      );

      -- Attendance records table
      CREATE TABLE IF NOT EXISTS attendance_records (
        id TEXT PRIMARY KEY,
        employee_id TEXT NOT NULL,
        date DATE NOT NULL,
        clock_in DATETIME,
        clock_out DATETIME,
        break_start DATETIME,
        break_end DATETIME,
        status TEXT CHECK(status IN ('present', 'absent', 'vacation', 'sick', 'permission')) NOT NULL,
        notes TEXT,
        total_hours REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_schedule_employee ON schedule_entries(employee_id);
      CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule_entries(date);
      CREATE INDEX IF NOT EXISTS idx_media_employee ON media_files(employee_id);
      CREATE INDEX IF NOT EXISTS idx_location_user ON location_tracking(user_id);
      CREATE INDEX IF NOT EXISTS idx_location_timestamp ON location_tracking(timestamp);
      CREATE INDEX IF NOT EXISTS idx_chat_sender ON chat_messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_chat_recipient ON chat_messages(recipient_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_records(employee_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
    `;

    db.exec(createTables, async (err) => {
      if (err) {
        console.error('Error creating tables:', err);
        reject(err);
        return;
      }

      try {
        await seedInitialData(db);
        console.log('✅ Database tables created and seeded successfully');
        db.close();
        resolve();
      } catch (seedError) {
        console.error('Error seeding data:', seedError);
        reject(seedError);
      }
    });
  });
}

// Seed initial data
async function seedInitialData(db) {
  return new Promise(async (resolve, reject) => {
    try {
      // Hash password for demo users
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      // Insert demo users
      const insertUsers = `
        INSERT OR IGNORE INTO users (id, name, email, password, role, company_name, address) VALUES
        ('admin-1', 'Marco Admin', 'admin@company.com', ?, 'admin', NULL, NULL),
        ('employee-1', 'Luigi Rossi', 'luigi@company.com', ?, 'employee', NULL, NULL),
        ('employee-2', 'Maria Bianchi', 'maria@company.com', ?, 'employee', NULL, NULL),
        ('client-1', 'Anna Cliente', 'anna@client.com', ?, 'client', 'Condominio Verde', 'Via Roma 123, Roma'),
        ('client-2', 'Paolo Amministratore', 'paolo@admin.com', ?, 'client', 'Condominio Rosso', 'Via Milano 456, Roma');
      `;

      db.run(insertUsers, [hashedPassword, hashedPassword, hashedPassword, hashedPassword, hashedPassword], (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Insert demo teams
        const insertTeams = `
          INSERT OR IGNORE INTO teams (id, name, description, color) VALUES
          ('team-1', 'Squadra Manutenzione', 'Team specializzato in manutenzione impianti', '#3B82F6'),
          ('team-2', 'Squadra Pulizie', 'Team dedicato alle pulizie condominiali', '#10B981');
        `;

        db.run(insertTeams, (err) => {
          if (err) {
            reject(err);
            return;
          }

          // Insert team members
          const insertTeamMembers = `
            INSERT OR IGNORE INTO team_members (team_id, user_id) VALUES
            ('team-1', 'employee-1'),
            ('team-2', 'employee-2');
          `;

          db.run(insertTeamMembers, (err) => {
            if (err) {
              reject(err);
              return;
            }

            // Insert demo schedule entries
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const insertSchedule = `
              INSERT OR IGNORE INTO schedule_entries (id, employee_id, client_id, date, start_time, end_time, location, address, description) VALUES
              ('schedule-1', 'employee-1', 'client-1', ?, '09:00', '10:30', 'Condominio Verde', 'Via Roma 123, Roma', 'Manutenzione ascensore'),
              ('schedule-2', 'employee-2', 'client-2', ?, '14:00', '16:00', 'Condominio Rosso', 'Via Milano 456, Roma', 'Controllo impianto elettrico'),
              ('schedule-3', 'employee-1', 'client-1', ?, '11:00', '12:30', 'Condominio Verde', 'Via Roma 123, Roma', 'Pulizia filtri climatizzatore');
            `;

            db.run(insertSchedule, [today, today, tomorrow], (err) => {
              if (err) {
                reject(err);
                return;
              }

              console.log('✅ Initial data seeded successfully');
              resolve();
            });
          });
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  createConnection,
  initializeDatabase,
  DB_PATH
};