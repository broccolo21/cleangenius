const express = require('express');
const { createConnection } = require('../database/init.cjs');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireRole('admin'), (req, res) => {
  const { role, search, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  const db = createConnection();
  
  let query = `
    SELECT id, name, email, role, avatar, phone, company_name, address, is_active, created_at
    FROM users 
    WHERE 1=1
  `;
  const params = [];

  // Filter by role
  if (role && ['admin', 'employee', 'client'].includes(role)) {
    query += ' AND role = ?';
    params.push(role);
  }

  // Search by name or email
  if (search) {
    query += ' AND (name LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, users) => {
    if (err) {
      db.close();
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];

    if (role && ['admin', 'employee', 'client'].includes(role)) {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    db.get(countQuery, countParams, (err, countResult) => {
      db.close();
      
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// Get user by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;

  // Users can only view their own profile unless they're admin
  if (requestingUser.role !== 'admin' && requestingUser.id !== id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const db = createConnection();
  
  db.get(
    'SELECT id, name, email, role, avatar, phone, company_name, address, is_active, created_at FROM users WHERE id = ?',
    [id],
    (err, user) => {
      db.close();
      
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    }
  );
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { name, email, role, phone, companyName, address, isActive } = req.body;

  const db = createConnection();
  
  db.run(
    `UPDATE users SET 
     name = COALESCE(?, name),
     email = COALESCE(?, email),
     role = COALESCE(?, role),
     phone = COALESCE(?, phone),
     company_name = COALESCE(?, company_name),
     address = COALESCE(?, address),
     is_active = COALESCE(?, is_active),
     updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, email, role, phone, companyName, address, isActive, id],
    function(err) {
      if (err) {
        db.close();
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(409).json({ error: 'Email already exists' });
        }
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (this.changes === 0) {
        db.close();
        return res.status(404).json({ error: 'User not found' });
      }

      // Get updated user
      db.get(
        'SELECT id, name, email, role, avatar, phone, company_name, address, is_active, created_at FROM users WHERE id = ?',
        [id],
        (err, user) => {
          db.close();
          
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }

          res.json({
            message: 'User updated successfully',
            user
          });
        }
      );
    }
  );
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (req.user.id === id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  const db = createConnection();
  
  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    db.close();
    
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  });
});

// Get employees with location data
router.get('/employees/locations', authenticateToken, requireRole(['admin']), (req, res) => {
  const db = createConnection();
  
  const query = `
    SELECT 
      u.id, u.name, u.email, u.phone,
      lt.latitude, lt.longitude, lt.accuracy, lt.speed, lt.battery_level, lt.timestamp
    FROM users u
    LEFT JOIN (
      SELECT DISTINCT user_id, latitude, longitude, accuracy, speed, battery_level, timestamp,
             ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY timestamp DESC) as rn
      FROM location_tracking
    ) lt ON u.id = lt.user_id AND lt.rn = 1
    WHERE u.role = 'employee' AND u.is_active = 1
    ORDER BY u.name
  `;

  db.all(query, [], (err, employees) => {
    db.close();
    
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ employees });
  });
});

module.exports = router;