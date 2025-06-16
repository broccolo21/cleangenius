const express = require('express');
const { createConnection } = require('../database/init.cjs');
const { authenticateToken, requireRole } = require('../middleware/auth.cjs');

const router = express.Router();

// Update location
router.post('/location', authenticateToken, requireRole(['employee', 'admin']), (req, res) => {
  const { latitude, longitude, accuracy, speed, heading, batteryLevel } = req.body;
  const userId = req.user.role === 'employee' ? req.user.id : req.body.userId;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const db = createConnection();
  
  db.run(
    `INSERT INTO location_tracking 
     (user_id, latitude, longitude, accuracy, speed, heading, battery_level)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, latitude, longitude, accuracy, speed, heading, batteryLevel],
    function(err) {
      db.close();
      
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(201).json({
        message: 'Location updated successfully',
        locationId: this.lastID
      });
    }
  );
});

// Get current locations of all employees (admin only)
router.get('/locations', authenticateToken, requireRole('admin'), (req, res) => {
  const { userId } = req.query;

  const db = createConnection();
  
  let query = `
    SELECT 
      u.id, u.name, u.email,
      lt.latitude, lt.longitude, lt.accuracy, lt.speed, lt.heading, 
      lt.battery_level, lt.timestamp
    FROM users u
    LEFT JOIN (
      SELECT DISTINCT user_id, latitude, longitude, accuracy, speed, heading, 
             battery_level, timestamp,
             ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY timestamp DESC) as rn
      FROM location_tracking
    ) lt ON u.id = lt.user_id AND lt.rn = 1
    WHERE u.role = 'employee' AND u.is_active = 1
  `;
  const params = [];

  if (userId) {
    query += ' AND u.id = ?';
    params.push(userId);
  }

  query += ' ORDER BY u.name';

  db.all(query, params, (err, locations) => {
    db.close();
    
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ locations });
  });
});

// Get location history for a user
router.get('/history/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate, page = 1, limit = 100 } = req.query;
  const offset = (page - 1) * limit;
  const requestingUser = req.user;

  // Check permissions
  if (requestingUser.role === 'employee' && requestingUser.id !== userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (requestingUser.role === 'client') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const db = createConnection();
  
  let query = `
    SELECT * FROM location_tracking
    WHERE user_id = ?
  `;
  const params = [userId];

  if (startDate) {
    query += ' AND DATE(timestamp) >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND DATE(timestamp) <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, history) => {
    db.close();
    
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ history });
  });
});

// Log gesture data
router.post('/gesture', authenticateToken, requireRole(['employee', 'admin']), (req, res) => {
  const { gestureType, confidence, isCorrect, scheduleEntryId } = req.body;
  const employeeId = req.user.role === 'employee' ? req.user.id : req.body.employeeId;

  if (!gestureType || !employeeId) {
    return res.status(400).json({ error: 'Gesture type and employee ID are required' });
  }

  const db = createConnection();
  
  db.run(
    `INSERT INTO gesture_logs 
     (employee_id, schedule_entry_id, gesture_type, confidence, is_correct)
     VALUES (?, ?, ?, ?, ?)`,
    [employeeId, scheduleEntryId, gestureType, confidence, isCorrect],
    function(err) {
      db.close();
      
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(201).json({
        message: 'Gesture logged successfully',
        gestureId: this.lastID
      });
    }
  );
});

// Get gesture statistics
router.get('/gestures/stats', authenticateToken, requireRole(['admin', 'employee']), (req, res) => {
  const { employeeId, startDate, endDate } = req.query;
  const requestingUser = req.user;

  // If employee, can only see their own stats
  const targetEmployeeId = requestingUser.role === 'employee' ? requestingUser.id : employeeId;

  const db = createConnection();
  
  let query = `
    SELECT 
      gesture_type,
      COUNT(*) as total_count,
      SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
      AVG(confidence) as avg_confidence
    FROM gesture_logs
    WHERE 1=1
  `;
  const params = [];

  if (targetEmployeeId) {
    query += ' AND employee_id = ?';
    params.push(targetEmployeeId);
  }

  if (startDate) {
    query += ' AND DATE(timestamp) >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND DATE(timestamp) <= ?';
    params.push(endDate);
  }

  query += ' GROUP BY gesture_type ORDER BY total_count DESC';

  db.all(query, params, (err, stats) => {
    db.close();
    
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ stats });
  });
});

// Delete old location data (admin only)
router.delete('/cleanup', authenticateToken, requireRole('admin'), (req, res) => {
  const { daysOld = 30 } = req.query;

  const db = createConnection();
  
  db.run(
    'DELETE FROM location_tracking WHERE timestamp < datetime("now", "-" || ? || " days")',
    [parseInt(daysOld)],
    function(err) {
      db.close();
      
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json({
        message: 'Old location data cleaned up successfully',
        deletedRecords: this.changes
      });
    }
  );
});

module.exports = router;