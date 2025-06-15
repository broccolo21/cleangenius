const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { createConnection } = require('../database/init');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get schedule entries
router.get('/', authenticateToken, (req, res) => {
  const { employeeId, clientId, date, status, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  const requestingUser = req.user;

  const db = createConnection();
  
  let query = `
    SELECT 
      se.*,
      e.name as employee_name,
      e.email as employee_email,
      c.name as client_name,
      c.company_name as client_company
    FROM schedule_entries se
    LEFT JOIN users e ON se.employee_id = e.id
    LEFT JOIN users c ON se.client_id = c.id
    WHERE 1=1
  `;
  const params = [];

  // Role-based filtering
  if (requestingUser.role === 'employee') {
    query += ' AND se.employee_id = ?';
    params.push(requestingUser.id);
  } else if (requestingUser.role === 'client') {
    query += ' AND se.client_id = ?';
    params.push(requestingUser.id);
  }

  // Additional filters
  if (employeeId) {
    query += ' AND se.employee_id = ?';
    params.push(employeeId);
  }

  if (clientId) {
    query += ' AND se.client_id = ?';
    params.push(clientId);
  }

  if (date) {
    query += ' AND se.date = ?';
    params.push(date);
  }

  if (status) {
    query += ' AND se.status = ?';
    params.push(status);
  }

  query += ' ORDER BY se.date DESC, se.start_time ASC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, entries) => {
    db.close();
    
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ entries });
  });
});

// Get schedule entry by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;

  const db = createConnection();
  
  const query = `
    SELECT 
      se.*,
      e.name as employee_name,
      e.email as employee_email,
      c.name as client_name,
      c.company_name as client_company
    FROM schedule_entries se
    LEFT JOIN users e ON se.employee_id = e.id
    LEFT JOIN users c ON se.client_id = c.id
    WHERE se.id = ?
  `;

  db.get(query, [id], (err, entry) => {
    db.close();
    
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!entry) {
      return res.status(404).json({ error: 'Schedule entry not found' });
    }

    // Check permissions
    if (requestingUser.role === 'employee' && entry.employee_id !== requestingUser.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (requestingUser.role === 'client' && entry.client_id !== requestingUser.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ entry });
  });
});

// Create schedule entry (admin only)
router.post('/', authenticateToken, requireRole('admin'), (req, res) => {
  const {
    employeeId,
    clientId,
    date,
    startTime,
    endTime,
    location,
    address,
    description
  } = req.body;

  if (!employeeId || !date || !startTime || !endTime || !location || !address) {
    return res.status(400).json({ 
      error: 'Employee ID, date, start time, end time, location, and address are required' 
    });
  }

  const entryId = uuidv4();
  const db = createConnection();
  
  db.run(
    `INSERT INTO schedule_entries 
     (id, employee_id, client_id, date, start_time, end_time, location, address, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [entryId, employeeId, clientId, date, startTime, endTime, location, address, description],
    function(err) {
      if (err) {
        db.close();
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Get the created entry with related data
      const query = `
        SELECT 
          se.*,
          e.name as employee_name,
          e.email as employee_email,
          c.name as client_name,
          c.company_name as client_company
        FROM schedule_entries se
        LEFT JOIN users e ON se.employee_id = e.id
        LEFT JOIN users c ON se.client_id = c.id
        WHERE se.id = ?
      `;

      db.get(query, [entryId], (err, entry) => {
        db.close();
        
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        res.status(201).json({
          message: 'Schedule entry created successfully',
          entry
        });
      });
    }
  );
});

// Update schedule entry
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    employeeId,
    clientId,
    date,
    startTime,
    endTime,
    location,
    address,
    description,
    status
  } = req.body;
  const requestingUser = req.user;

  const db = createConnection();
  
  // First check if entry exists and user has permission
  db.get('SELECT * FROM schedule_entries WHERE id = ?', [id], (err, entry) => {
    if (err) {
      db.close();
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!entry) {
      db.close();
      return res.status(404).json({ error: 'Schedule entry not found' });
    }

    // Check permissions
    if (requestingUser.role === 'employee') {
      if (entry.employee_id !== requestingUser.id) {
        db.close();
        return res.status(403).json({ error: 'Access denied' });
      }
      // Employees can only update status
      if (status && ['in-progress', 'completed'].includes(status)) {
        db.run(
          'UPDATE schedule_entries SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [status, id],
          function(err) {
            db.close();
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ message: 'Schedule entry status updated successfully' });
          }
        );
        return;
      } else {
        db.close();
        return res.status(400).json({ error: 'Employees can only update status to in-progress or completed' });
      }
    }

    if (requestingUser.role === 'client' && entry.client_id !== requestingUser.id) {
      db.close();
      return res.status(403).json({ error: 'Access denied' });
    }

    // Admin or client can update all fields
    db.run(
      `UPDATE schedule_entries SET 
       employee_id = COALESCE(?, employee_id),
       client_id = COALESCE(?, client_id),
       date = COALESCE(?, date),
       start_time = COALESCE(?, start_time),
       end_time = COALESCE(?, end_time),
       location = COALESCE(?, location),
       address = COALESCE(?, address),
       description = COALESCE(?, description),
       status = COALESCE(?, status),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [employeeId, clientId, date, startTime, endTime, location, address, description, status, id],
      function(err) {
        db.close();
        
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        res.json({ message: 'Schedule entry updated successfully' });
      }
    );
  });
});

// Delete schedule entry (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;

  const db = createConnection();
  
  db.run('DELETE FROM schedule_entries WHERE id = ?', [id], function(err) {
    db.close();
    
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Schedule entry not found' });
    }

    res.json({ message: 'Schedule entry deleted successfully' });
  });
});

// Get schedule statistics
router.get('/stats/overview', authenticateToken, requireRole('admin'), (req, res) => {
  const { startDate, endDate } = req.query;

  const db = createConnection();
  
  let query = `
    SELECT 
      status,
      COUNT(*) as count
    FROM schedule_entries
    WHERE 1=1
  `;
  const params = [];

  if (startDate) {
    query += ' AND date >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND date <= ?';
    params.push(endDate);
  }

  query += ' GROUP BY status';

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