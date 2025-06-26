const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/register', (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: "Completați toate câmpurile." });
  }

  const sqlCheck = 'SELECT * FROM users WHERE username = ? OR email = ?';
  req.db.query(sqlCheck, [username, email], (err, results) => {
    if (err) return res.status(500).send('Eroare la verificare utilizator.');

    if (results.length > 0) {
      return res.status(400).json({ message: 'Username sau email deja folosit.' });
    }

    const sqlInsert = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
    req.db.query(sqlInsert, [username, password, email], (err, result) => {
      if (err) return res.status(500).send('Eroare la crearea utilizatorului.');

      res.json({ message: 'Înregistrare reușită!' });
    });
  });
});


router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Completați toate câmpurile." });
  }

  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  req.db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).send('Eroare la interogare.');

    if (results.length === 0) {
      return res.status(401).json({ message: 'Email sau parolă incorectă.' });
    }
    const JWT_SECRET = 'secret123';
    const user = results[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' })

    res.json({ message: 'Autentificare reușită.', token });
  });
});

module.exports = router;
