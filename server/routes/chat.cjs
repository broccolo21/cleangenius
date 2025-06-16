const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { createConnection } = require('../database/init.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();

// Get chat messages
router.get('/', authenticateToken, (req, res) => {
  const { recipientId, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  const userId = req.user.id;

  const db = createConnection();
  
  let query = `
    SELECT 
      cm.*,
      s.name as sender_name,
      r.name as recipient_name
    FROM chat_messages cm
    LEFT JOIN users s ON cm.sender_id = s.id
    LEFT JOIN users r ON cm.recipient_id = r.id
    WHERE (cm.sender_id = ? OR cm.recipient_id = ?)
  `;
  const params = [userId, userId];

  if (recipientId) {
    query += ' AND ((cm.sender_id = ? AND cm.recipient_id = ?) OR (cm.sender_id = ? AND cm.recipient_id = ?))';
    params.push(userId, recipientId, recipientId, userId);
  }

  query += ' ORDER BY cm.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, messages) => {
    db.close();
    
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ messages: messages.reverse() }); // Reverse to show oldest first
  });
});

// Send message
router.post('/', authenticateToken, (req, res) => {
  const { recipientId, content, type = 'text', fileUrl } = req.body;
  const senderId = req.user.id;

  if (!recipientId || !content) {
    return res.status(400).json({ error: 'Recipient ID and content are required' });
  }

  const messageId = uuidv4();
  const db = createConnection();
  
  db.run(
    `INSERT INTO chat_messages (id, sender_id, recipient_id, content, type, file_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [messageId, senderId, recipientId, content, type, fileUrl],
    function(err) {
      if (err) {
        db.close();
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Get the created message with user names
      db.get(
        `SELECT 
           cm.*,
           s.name as sender_name,
           r.name as recipient_name
         FROM chat_messages cm
         LEFT JOIN users s ON cm.sender_id = s.id
         LEFT JOIN users r ON cm.recipient_id = r.id
         WHERE cm.id = ?`,
        [messageId],
        (err, message) => {
          db.close();
          
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }

          res.status(201).json({
            message: 'Message sent successfully',
            chatMessage: message
          });
        }
      );
    }
  );
});

// Mark messages as read
router.put('/mark-read', authenticateToken, (req, res) => {
  const { senderId } = req.body;
  const recipientId = req.user.id;

  if (!senderId) {
    return res.status(400).json({ error: 'Sender ID is required' });
  }

  const db = createConnection();
  
  db.run(
    'UPDATE chat_messages SET is_read = 1 WHERE sender_id = ? AND recipient_id = ? AND is_read = 0',
    [senderId, recipientId],
    function(err) {
      db.close();
      
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json({ 
        message: 'Messages marked as read',
        updatedCount: this.changes
      });
    }
  );
});

// Get conversation list
router.get('/conversations', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const db = createConnection();
  
  const query = `
    SELECT DISTINCT
      CASE 
        WHEN cm.sender_id = ? THEN cm.recipient_id 
        ELSE cm.sender_id 
      END as contact_id,
      CASE 
        WHEN cm.sender_id = ? THEN r.name 
        ELSE s.name 
      END as contact_name,
      CASE 
        WHEN cm.sender_id = ? THEN r.role 
        ELSE s.role 
      END as contact_role,
      cm.content as last_message,
      cm.created_at as last_message_time,
      COUNT(CASE WHEN cm.recipient_id = ? AND cm.is_read = 0 THEN 1 END) as unread_count
    FROM chat_messages cm
    LEFT JOIN users s ON cm.sender_id = s.id
    LEFT JOIN users r ON cm.recipient_id = r.id
    WHERE cm.sender_id = ? OR cm.recipient_id = ?
    GROUP BY contact_id
    ORDER BY last_message_time DESC
  `;

  db.all(query, [userId, userId, userId, userId, userId, userId], (err, conversations) => {
    db.close();
    
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ conversations });
  });
});

// Delete message
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const db = createConnection();
  
  // Check if user owns the message
  db.get('SELECT * FROM chat_messages WHERE id = ? AND sender_id = ?', [id, userId], (err, message) => {
    if (err) {
      db.close();
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!message) {
      db.close();
      return res.status(404).json({ error: 'Message not found or access denied' });
    }

    db.run('DELETE FROM chat_messages WHERE id = ?', [id], function(err) {
      db.close();
      
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json({ message: 'Message deleted successfully' });
    });
  });
});

// Get unread message count
router.get('/unread-count', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const db = createConnection();
  
  db.get(
    'SELECT COUNT(*) as count FROM chat_messages WHERE recipient_id = ? AND is_read = 0',
    [userId],
    (err, result) => {
      db.close();
      
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json({ unreadCount: result.count });
    }
  );
});

module.exports = router;