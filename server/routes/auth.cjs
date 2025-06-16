const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { createConnection } = require('../database/init.cjs');
const { generateToken, authenticateToken, getUserById } = require('../middleware/auth.cjs');

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = createConnection();
    
    db.get(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [email],
      async (err, user) => {
        db.close();
        
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
          message: 'Login successful',
          token,
          user: userWithoutPassword
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, companyName, address, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    if (!['admin', 'employee', 'client'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const db = createConnection();
    
    db.run(
      `INSERT INTO users (id, name, email, password, role, company_name, address, phone) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, email, hashedPassword, role, companyName || null, address || null, phone || null],
      function(err) {
        if (err) {
          db.close();
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: 'Email already exists' });
          }
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Get the created user
        db.get(
          'SELECT id, name, email, role, company_name, address, phone, is_active, created_at FROM users WHERE id = ?',
          [userId],
          (err, user) => {
            db.close();
            
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }

            const token = generateToken(user);

            res.status(201).json({
              message: 'User registered successfully',
              token,
              user
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, phone, companyName, address } = req.body;
    const userId = req.user.id;

    const db = createConnection();
    
    db.run(
      `UPDATE users SET 
       name = COALESCE(?, name),
       phone = COALESCE(?, phone),
       company_name = COALESCE(?, company_name),
       address = COALESCE(?, address),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, phone, companyName, address, userId],
      function(err) {
        if (err) {
          db.close();
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Get updated user
        db.get(
          'SELECT id, name, email, role, company_name, address, phone, is_active, created_at FROM users WHERE id = ?',
          [userId],
          (err, user) => {
            db.close();
            
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({
              message: 'Profile updated successfully',
              user
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const db = createConnection();
    
    // Get current user with password
    db.get(
      'SELECT password FROM users WHERE id = ?',
      [userId],
      async (err, user) => {
        if (err) {
          db.close();
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!user) {
          db.close();
          return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
          db.close();
          return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        db.run(
          'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [hashedNewPassword, userId],
          (err) => {
            db.close();
            
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({ message: 'Password changed successfully' });
          }
        );
      }
    );
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;