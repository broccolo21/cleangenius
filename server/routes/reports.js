const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { createConnection } = require('../database/init');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get reports
router.get('/', authenticateToken, (req, res) => {
  const { clientId, employeeId, status, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  const requestingUser = req.user;

  const db = createConnection();
  
  let query = `
    SELECT 
      r.*,
      c.name as client_name,
      c.company_name as client_company,
      e.name as employee_name
    FROM reports r
    LEFT JOIN users c ON r.client_id = c.id
    LEFT JOIN users e ON r.employee_id = e.id
    WHERE 1=1
  `;
  const params = [];

  // Role-based filtering
  if (requestingUser.role === 'client') {
    query += ' AND r.client_id = ?';
    params.push(requestingUser.id);
  } else if (requestingUser.role === 'employee') {
    query += ' AND r.employee_id = ?';
    params.push(requestingUser.id);
  }

  // Additional filters
  if (clientId) {
    query += ' AND r.client_id = ?';
    params.push(clientId);
  }

  if (employeeId) {
    query += ' AND r.employee_id = ?';
    params.push(employeeId);
  }

  if (status) {
    query += ' AND r.status = ?';
    params.push(status);
  }

  query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, reports) => {
    if (err) {
      db.close();
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Get media files for each report
    const reportIds = reports.map(r => r.id);
    if (reportIds.length === 0) {
      db.close();
      return res.json({ reports: [] });
    }

    const mediaQuery = `
      SELECT 
        rm.report_id,
        mf.*
      FROM report_media rm
      JOIN media_files mf ON rm.media_id = mf.id
      WHERE rm.report_id IN (${reportIds.map(() => '?').join(',')})
    `;

    db.all(mediaQuery, reportIds, (err, mediaFiles) => {
      db.close();
      
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Group media files by report ID
      const mediaByReport = {};
      mediaFiles.forEach(media => {
        if (!mediaByReport[media.report_id]) {
          mediaByReport[media.report_id] = [];
        }
        mediaByReport[media.report_id].push({
          ...media,
          ai_analysis: media.ai_analysis ? JSON.parse(media.ai_analysis) : null
        });
      });

      // Add media files to reports
      const reportsWithMedia = reports.map(report => ({
        ...report,
        media_files: mediaByReport[report.id] || []
      }));

      res.json({ reports: reportsWithMedia });
    });
  });
});

// Get report by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;

  const db = createConnection();
  
  const query = `
    SELECT 
      r.*,
      c.name as client_name,
      c.company_name as client_company,
      e.name as employee_name
    FROM reports r
    LEFT JOIN users c ON r.client_id = c.id
    LEFT JOIN users e ON r.employee_id = e.id
    WHERE r.id = ?
  `;

  db.get(query, [id], (err, report) => {
    if (err) {
      db.close();
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!report) {
      db.close();
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check permissions
    if (requestingUser.role === 'client' && report.client_id !== requestingUser.id) {
      db.close();
      return res.status(403).json({ error: 'Access denied' });
    }

    if (requestingUser.role === 'employee' && report.employee_id !== requestingUser.id) {
      db.close();
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get media files for this report
    const mediaQuery = `
      SELECT mf.*
      FROM report_media rm
      JOIN media_files mf ON rm.media_id = mf.id
      WHERE rm.report_id = ?
    `;

    db.all(mediaQuery, [id], (err, mediaFiles) => {
      db.close();
      
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const mediaWithParsedAnalysis = mediaFiles.map(media => ({
        ...media,
        ai_analysis: media.ai_analysis ? JSON.parse(media.ai_analysis) : null
      }));

      res.json({
        report: {
          ...report,
          media_files: mediaWithParsedAnalysis
        }
      });
    });
  });
});

// Create report (admin only)
router.post('/', authenticateToken, requireRole('admin'), (req, res) => {
  const { clientId, employeeId, title, content, mediaFileIds = [] } = req.body;

  if (!clientId || !employeeId || !title) {
    return res.status(400).json({ error: 'Client ID, employee ID, and title are required' });
  }

  const reportId = uuidv4();
  const db = createConnection();
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Insert report
    db.run(
      'INSERT INTO reports (id, client_id, employee_id, title, content) VALUES (?, ?, ?, ?, ?)',
      [reportId, clientId, employeeId, title, content],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          db.close();
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Insert media file associations
        if (mediaFileIds.length > 0) {
          const insertMediaPromises = mediaFileIds.map(mediaId => {
            return new Promise((resolve, reject) => {
              db.run(
                'INSERT INTO report_media (report_id, media_id) VALUES (?, ?)',
                [reportId, mediaId],
                (err) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          });

          Promise.all(insertMediaPromises)
            .then(() => {
              db.run('COMMIT');
              
              // Get the created report with related data
              const query = `
                SELECT 
                  r.*,
                  c.name as client_name,
                  c.company_name as client_company,
                  e.name as employee_name
                FROM reports r
                LEFT JOIN users c ON r.client_id = c.id
                LEFT JOIN users e ON r.employee_id = e.id
                WHERE r.id = ?
              `;

              db.get(query, [reportId], (err, report) => {
                db.close();
                
                if (err) {
                  console.error('Database error:', err);
                  return res.status(500).json({ error: 'Internal server error' });
                }

                res.status(201).json({
                  message: 'Report created successfully',
                  report
                });
              });
            })
            .catch((err) => {
              db.run('ROLLBACK');
              db.close();
              console.error('Database error:', err);
              res.status(500).json({ error: 'Internal server error' });
            });
        } else {
          db.run('COMMIT');
          db.close();
          res.status(201).json({
            message: 'Report created successfully',
            reportId
          });
        }
      }
    );
  });
});

// Update report
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, content, status } = req.body;
  const requestingUser = req.user;

  const db = createConnection();
  
  // First check if report exists and user has permission
  db.get('SELECT * FROM reports WHERE id = ?', [id], (err, report) => {
    if (err) {
      db.close();
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!report) {
      db.close();
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check permissions
    if (requestingUser.role === 'employee' && report.employee_id !== requestingUser.id) {
      db.close();
      return res.status(403).json({ error: 'Access denied' });
    }

    if (requestingUser.role === 'client' && report.client_id !== requestingUser.id) {
      db.close();
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update sent_at when status changes to 'sent'
    const sentAt = status === 'sent' && report.status !== 'sent' ? new Date().toISOString() : null;

    db.run(
      `UPDATE reports SET 
       title = COALESCE(?, title),
       content = COALESCE(?, content),
       status = COALESCE(?, status),
       sent_at = COALESCE(?, sent_at)
       WHERE id = ?`,
      [title, content, status, sentAt, id],
      function(err) {
        db.close();
        
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        res.json({ message: 'Report updated successfully' });
      }
    );
  });
});

// Delete report (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;

  const db = createConnection();
  
  db.run('DELETE FROM reports WHERE id = ?', [id], function(err) {
    db.close();
    
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ message: 'Report deleted successfully' });
  });
});

// Generate automatic report from media files
router.post('/generate', authenticateToken, requireRole('admin'), (req, res) => {
  const { clientId, employeeId, scheduleEntryId, title } = req.body;

  if (!clientId || !employeeId) {
    return res.status(400).json({ error: 'Client ID and employee ID are required' });
  }

  const db = createConnection();
  
  // Get media files for the schedule entry or employee
  let mediaQuery = `
    SELECT mf.* FROM media_files mf
    WHERE mf.employee_id = ? AND mf.status = 'approved'
  `;
  const mediaParams = [employeeId];

  if (scheduleEntryId) {
    mediaQuery += ' AND mf.schedule_entry_id = ?';
    mediaParams.push(scheduleEntryId);
  }

  mediaQuery += ' ORDER BY mf.created_at DESC';

  db.all(mediaQuery, mediaParams, (err, mediaFiles) => {
    if (err) {
      db.close();
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (mediaFiles.length === 0) {
      db.close();
      return res.status(400).json({ error: 'No approved media files found' });
    }

    // Generate report content based on AI analysis
    let reportContent = 'Report generato automaticamente:\n\n';
    
    mediaFiles.forEach((media, index) => {
      reportContent += `${index + 1}. ${media.type === 'photo' ? 'Foto' : 'Video'}: ${media.original_name}\n`;
      if (media.caption) {
        reportContent += `   Descrizione: ${media.caption}\n`;
      }
      if (media.ai_analysis) {
        const analysis = JSON.parse(media.ai_analysis);
        reportContent += `   Analisi AI: ${analysis.description}\n`;
        if (analysis.observations && analysis.observations.length > 0) {
          reportContent += `   Osservazioni: ${analysis.observations.join(', ')}\n`;
        }
      }
      reportContent += '\n';
    });

    const reportId = uuidv4();
    const reportTitle = title || `Report automatico - ${new Date().toLocaleDateString('it-IT')}`;

    // Create report
    db.run(
      'INSERT INTO reports (id, client_id, employee_id, title, content, status) VALUES (?, ?, ?, ?, ?, ?)',
      [reportId, clientId, employeeId, reportTitle, reportContent, 'draft'],
      function(err) {
        if (err) {
          db.close();
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Associate media files with report
        const insertMediaPromises = mediaFiles.map(media => {
          return new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO report_media (report_id, media_id) VALUES (?, ?)',
              [reportId, media.id],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        });

        Promise.all(insertMediaPromises)
          .then(() => {
            db.close();
            res.status(201).json({
              message: 'Report generated successfully',
              reportId,
              mediaCount: mediaFiles.length
            });
          })
          .catch((err) => {
            db.close();
            console.error('Database error:', err);
            res.status(500).json({ error: 'Internal server error' });
          });
      }
    );
  });
});

module.exports = router;