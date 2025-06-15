const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { createConnection } = require('../database/init');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Get media files
router.get('/', authenticateToken, (req, res) => {
  const { employeeId, scheduleEntryId, type, status, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  const requestingUser = req.user;

  const db = createConnection();
  
  let query = `
    SELECT 
      mf.*,
      u.name as employee_name,
      se.location as schedule_location
    FROM media_files mf
    LEFT JOIN users u ON mf.employee_id = u.id
    LEFT JOIN schedule_entries se ON mf.schedule_entry_id = se.id
    WHERE 1=1
  `;
  const params = [];

  // Role-based filtering
  if (requestingUser.role === 'employee') {
    query += ' AND mf.employee_id = ?';
    params.push(requestingUser.id);
  } else if (requestingUser.role === 'client') {
    query += ' AND se.client_id = ?';
    params.push(requestingUser.id);
  }

  // Additional filters
  if (employeeId) {
    query += ' AND mf.employee_id = ?';
    params.push(employeeId);
  }

  if (scheduleEntryId) {
    query += ' AND mf.schedule_entry_id = ?';
    params.push(scheduleEntryId);
  }

  if (type && ['photo', 'video'].includes(type)) {
    query += ' AND mf.type = ?';
    params.push(type);
  }

  if (status) {
    query += ' AND mf.status = ?';
    params.push(status);
  }

  query += ' ORDER BY mf.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, files) => {
    db.close();
    
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Parse AI analysis JSON
    const filesWithParsedAnalysis = files.map(file => ({
      ...file,
      ai_analysis: file.ai_analysis ? JSON.parse(file.ai_analysis) : null
    }));

    res.json({ files: filesWithParsedAnalysis });
  });
});

// Upload media file
router.post('/upload', authenticateToken, requireRole(['employee', 'admin']), upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { scheduleEntryId, caption } = req.body;
    const employeeId = req.user.role === 'employee' ? req.user.id : req.body.employeeId;

    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }

    // Determine file type
    const isVideo = /\.(mp4|mov|avi|webm)$/i.test(req.file.originalname);
    const type = isVideo ? 'video' : 'photo';

    const fileId = uuidv4();
    const fileUrl = `/uploads/${req.file.filename}`;

    const db = createConnection();
    
    db.run(
      `INSERT INTO media_files 
       (id, employee_id, schedule_entry_id, type, filename, original_name, url, caption, file_size, mime_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fileId,
        employeeId,
        scheduleEntryId || null,
        type,
        req.file.filename,
        req.file.originalname,
        fileUrl,
        caption || null,
        req.file.size,
        req.file.mimetype
      ],
      function(err) {
        if (err) {
          db.close();
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Get the created file
        db.get(
          `SELECT 
             mf.*,
             u.name as employee_name
           FROM media_files mf
           LEFT JOIN users u ON mf.employee_id = u.id
           WHERE mf.id = ?`,
          [fileId],
          (err, file) => {
            db.close();
            
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }

            res.status(201).json({
              message: 'File uploaded successfully',
              file
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update media file
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { caption, status, aiAnalysis } = req.body;
  const requestingUser = req.user;

  const db = createConnection();
  
  // First check if file exists and user has permission
  db.get('SELECT * FROM media_files WHERE id = ?', [id], (err, file) => {
    if (err) {
      db.close();
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!file) {
      db.close();
      return res.status(404).json({ error: 'Media file not found' });
    }

    // Check permissions
    if (requestingUser.role === 'employee' && file.employee_id !== requestingUser.id) {
      db.close();
      return res.status(403).json({ error: 'Access denied' });
    }

    const aiAnalysisJson = aiAnalysis ? JSON.stringify(aiAnalysis) : null;

    db.run(
      `UPDATE media_files SET 
       caption = COALESCE(?, caption),
       status = COALESCE(?, status),
       ai_analysis = COALESCE(?, ai_analysis)
       WHERE id = ?`,
      [caption, status, aiAnalysisJson, id],
      function(err) {
        db.close();
        
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        res.json({ message: 'Media file updated successfully' });
      }
    );
  });
});

// Delete media file
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;

  const db = createConnection();
  
  // First get the file to check permissions and get filename
  db.get('SELECT * FROM media_files WHERE id = ?', [id], (err, file) => {
    if (err) {
      db.close();
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!file) {
      db.close();
      return res.status(404).json({ error: 'Media file not found' });
    }

    // Check permissions
    if (requestingUser.role === 'employee' && file.employee_id !== requestingUser.id) {
      db.close();
      return res.status(403).json({ error: 'Access denied' });
    }

    if (requestingUser.role === 'client') {
      db.close();
      return res.status(403).json({ error: 'Clients cannot delete media files' });
    }

    // Delete from database
    db.run('DELETE FROM media_files WHERE id = ?', [id], function(err) {
      db.close();
      
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Delete physical file
      const filePath = path.join(uploadsDir, file.filename);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          // Don't return error to client as database deletion was successful
        }
      });

      res.json({ message: 'Media file deleted successfully' });
    });
  });
});

// Generate AI analysis for media file (admin only)
router.post('/:id/analyze', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;

  // Mock AI analysis - in production, this would call actual AI service
  const mockAnalysis = {
    description: "Immagine di manutenzione in corso con strumenti professionali visibili",
    observations: [
      "Utilizzo corretto degli strumenti",
      "Area di lavoro ordinata e sicura",
      "Procedure di sicurezza rispettate"
    ],
    recommendations: [
      "Continuare con le procedure standard",
      "Verificare completamento lavoro",
      "Documentare risultati finali"
    ],
    confidence: 0.85 + Math.random() * 0.1,
    tags: ["manutenzione", "sicurezza", "professionale", "standard"]
  };

  const db = createConnection();
  
  db.run(
    'UPDATE media_files SET ai_analysis = ?, status = ? WHERE id = ?',
    [JSON.stringify(mockAnalysis), 'analyzed', id],
    function(err) {
      db.close();
      
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Media file not found' });
      }

      res.json({
        message: 'AI analysis completed successfully',
        analysis: mockAnalysis
      });
    }
  );
});

// Get media statistics
router.get('/stats/overview', authenticateToken, requireRole('admin'), (req, res) => {
  const { startDate, endDate } = req.query;

  const db = createConnection();
  
  let query = `
    SELECT 
      type,
      status,
      COUNT(*) as count,
      SUM(file_size) as total_size
    FROM media_files
    WHERE 1=1
  `;
  const params = [];

  if (startDate) {
    query += ' AND DATE(created_at) >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND DATE(created_at) <= ?';
    params.push(endDate);
  }

  query += ' GROUP BY type, status';

  db.all(query, params, (err, stats) => {
    db.close();
    
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ stats });
  });
});

module.exports = router;