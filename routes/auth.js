const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });



// Get all users
router.get('/users', (req, res) => {
   console.log('📊 /showuser route hit', req.query);
  db.query('SELECT id, name, email, phone FROM userlogin', (err, result) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(result);
  });
});

router.get('/showuser', (req, res) => {
   console.log('📊 /showuser route hit', req.query);
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const query = 'SELECT name FROM userlogin WHERE email = ? LIMIT 1';
  db.query(query, [email], (err, result) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ name: result[0].name });
  });
});

// Update user
router.put('/users/:id', (req, res) => {
  const { name, email, phone } = req.body;
  db.query(
    'UPDATE userlogin SET name=?, email=?, phone=? WHERE id=?',
    [name, email, phone, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Update failed' });
      res.json({ success: true, message: 'User updated successfully' });
    }
  );
});

// Delete user
router.delete('/users/:id', (req, res) => {
  db.query('DELETE FROM userlogin WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    res.json({ success: true, message: 'User deleted successfully' });
  });
});
module.exports = router;  