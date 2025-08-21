const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../multer');

router.post('/userlogin', (req, res) => {
  console.log('📊 /userlogin route hit');
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    return res.status(400).json({ success: false, message: 'Email/Phone and password are required' });
  }

  // check with email or phone
  db.query(
    'SELECT * FROM userlogin WHERE email = ? ',
    [emailOrPhone, emailOrPhone],
    (err, result) => {
      if (err) {
        console.log('❌ SELECT error:', err);
        return res.status(500).json({ error: 'DB error' });
      }

      if (result.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const user = result[0];
      if (user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      res.json({ success: true, message: 'Login successful', user });
    }
  );
});

router.post('/usersignup', (req, res) => {
  console.log('📊 /usersignup route hit');
  try {
    console.log('📥 Received signup request');
    const { email, password, number, name } = req.body;

    console.log('📦 Body:', req.body);

    if (!email || !password || !number || !name) {
      console.log('⚠️ Missing required fields');
      return res.status(400).json({ success: false, message: 'Email, phone, name, and password are required' });
    }

    db.query(
      'SELECT * FROM userlogin WHERE email = ? OR phone = ?',
      [email, number],
      (err, result) => {
        if (err) {
          console.log('❌ SELECT error:', err);
          return res.status(500).json({ error: 'DB error' });
        }

        console.log('🔍 Existing user check complete. Matches found:', result.length);

        if (result.length > 0) {
          console.log('⚠️ User already exists:', email, number);
          return res.status(409).json({ success: false, message: 'Email or Phone already exists' });
        }

        db.query(
          'INSERT INTO userlogin (email, password, phone, name) VALUES (?, ?, ?, ?)',
          [email, password, number, name],
          (err2) => {
            if (err2) {
              console.log('❌ INSERT error:', err2);
              return res.status(500).json({ error: 'Insert error' });
            }

            console.log('✅ Signup successful for:', email);
            res.json({ success: true, message: 'Signup successful' });
          }
        );
      }
    );
  } catch (e) {
    console.log('🔥 Unexpected error:', e.message);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});


router.post('/signup', (req, res) => {
  try {
    console.log('📥 Received signup request');
    const { email, password } = req.body;

    // Log full request body
    console.log('📦 Body:', req.body);

    if (!email || !password) {
      console.log('⚠️ Missing email or password');
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    db.query('SELECT * FROM user WHERE email = ?', [email], (err, result) => {
      if (err) {
        console.log('❌ SELECT error:', err);
        return res.status(500).json({ error: 'DB error' });
      }

      console.log('🔍 Email check complete. Matches found:', result.length);

      if (result.length > 0) {
        console.log('⚠️ Email already exists:', email);
        return res.status(409).json({ success: false, message: 'Email already exists' });
      }

      db.query('INSERT INTO user (email, password) VALUES (?, ?)', [email, password], (err2) => {
        if (err2) {
          console.log('❌ INSERT error:', err2);
          return res.status(500).json({ error: 'Insert error' });
        }

        console.log('✅ Signup successful for:', email);
        res.json({ success: true, message: 'Signup successful' });
      });
    });
  } catch (e) {
    console.log('🔥 Unexpected error:', e.message);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// LOGIN ROUTE
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('📥 Login request:', email);

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  db.query('SELECT * FROM user WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.log('❌ DB SELECT error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email' });
    }

    const user = result[0];

    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    console.log('✅ Login successful for:', email);
    res.json({ success: true, message: 'Login successful' });
  });
});

 // POST /api/visitors/save
router.post('/save', upload.single('image'), (req, res) => {
   console.log('📊 / route hit');
   console.log('📩 Body:', req.body);
  console.log('📷 File:', req.file);

  const { name, email, phone, company, designation, program } = req.body;

  if (!name || !email || !phone || !company || !designation || !program) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = `
    INSERT INTO visitors (name, email, phone, company, designation, program, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [name, email, phone, company, designation, program, imagePath];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ DB Insert Error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
        
    return res.status(200).json({
      success: true,
      message: 'Visitor saved successfully',
      id: result.insertId,
    });
  });
});

// POST /upload
router.post('/upload', upload.single('image'), (req, res) => {
  

  console.log('Uploaded file:', req.file);

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
 

  const imageUrl = `http://198.168.10.78:3000/uploads/${req.file.filename}`;
  res.status(200).json({ success: true, imageUrl });
});



// routes/visitorRoutes.js

router.get('/', async (req, res) => {
  console.log('📊 / route hit');
  try {
    const sql = 'SELECT * FROM visitors'; // DESC removed
    db.query(sql, (err, results) => {
      if (err) {
        console.error('❌ Error fetching data:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      res.status(200).json({ visitors: results });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server exception' });
  }
});

router.get('/program', (req, res) => {
  const query = `
    SELECT program, COUNT(*) AS count
    FROM visitors
    GROUP BY program;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ success: false, message: 'Database query failed' });
    }

    res.json({
      success: true,
      data: results
    });
  });
});
// DELETE /api/visitors/:id

router.delete('/:id', (req, res) => {
  const visitorId = req.params.id;
  const query = 'DELETE FROM visitors WHERE idvisitors = ?';

  db.query(query, [visitorId], (err, result) => {
    if (err) {
      console.error('❌ DB delete error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    console.log(`✅ Deleted visitor ID: ${visitorId}`);
    res.json({ message: 'Visitor deleted successfully' });
  });
});
// UPDATE VISITOR
router.put('/:id', (req, res) => {
  const visitorId = req.params.id;
  const { name, email, phone, company, designation, program } = req.body;

  const query = `
    UPDATE visitors 
    SET name = ?, email = ?, phone = ?, company = ?, designation = ?, program = ?
    WHERE idvisitors = ?
  `;

  db.query(query, [name, email, phone, company, designation, program, visitorId], (err, result) => {
    if (err) {
      console.error('❌ Error updating visitor:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: 'Visitor updated successfully' });
  });
});
  

router.get('/total', (req, res) => {
   console.log('📊 /total route hit');
  const query = 'SELECT COUNT(*) AS total FROM visitors';

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Total count error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    const total = results[0]?.total || 0;
      console.log('🚀 Total Visitors Count:', total);

    res.json({
      success: true,
      total,
    });
  });
});



router.post('/programonly', (req, res) => {
   console.log('📥 Hit /programonly route');
    console.log('📥 Received /programonly POST request', req.body);
  const { program } = req.body;

  if (!program || program.trim() === '') {
    return res.status(400).json({ message: 'Program name is required' });
  }

  const sql = 'INSERT INTO program (program) VALUES (?)';
  db.query(sql, [program], (err, result) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ message: 'Failed to insert program' });
    }
    return res.status(200).json({ success: true, message: 'Program saved successfully' });
  });
});
router.get('/select', (req, res) => {
  console.log('📥 Hit /select route');
  const sql = 'SELECT idprogram AS id, program AS name FROM program ORDER BY program ASC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching programs:', err);
      return res.status(500).json({ success: false, message: 'Database Error' });
    }
    console.log('Programs fetched:', results);
    res.json({ success: true, programs: results });
  });
});

// GET all programs
router.get('/programs', (req, res) => {
   console.log('📥 Hit /program route');
  db.query('SELECT * FROM program', (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch programs' });
    }
    res.json(results);
  });
});

// ✏️ Update a program
router.put('/program/:id', (req, res) => {
  const { id } = req.params;
  const { program } = req.body;

  if (!program || !program.trim()) {
    return res.status(400).json({ error: 'Program name is required' });
  }

  db.query('UPDATE program SET program = ? WHERE idprogram = ?', [program, id], (err, result) => {
    if (err) {
      console.error('Error updating program:', err);
      return res.status(500).json({ error: 'Database update error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Program not found' });
    }

    res.json({ message: 'Program updated successfully' });
  });
});

// 🗑️ Delete a program
router.delete('/program/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM program WHERE idprogram = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting program:', err);
      return res.status(500).json({ error: 'Database delete error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Program not found' });
    }

    res.json({ message: 'Program deleted successfully' });
  });
});
module.exports = router;    