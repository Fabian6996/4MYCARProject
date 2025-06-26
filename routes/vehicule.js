const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

function toMysqlDate(dateString) {
  return dateString ? dateString.slice(0, 10) : null;
}

function saveToHistory(db, vehicul, userId, callback) {
  const sqlHistory = `
    INSERT INTO vehicule_history 
    (vehicul_id, nr_inmatriculare, asigurare_exp, itp_exp, rovinieta_exp, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sqlHistory,
    [
      vehicul.id,
      vehicul.nr_inmatriculare,
      vehicul.asigurare_exp,
      vehicul.itp_exp,
      vehicul.rovinieta_exp,
      userId
    ],
    callback
  );
}

router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT v.*, p.filename AS poza
    FROM vehicule v
    LEFT JOIN vehicul_photos p ON v.id = p.vehicul_id AND p.user_id = ?
    WHERE v.user_id = ?
  `;
  req.db.query(sql, [userId, userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Eroare la server.' });
    res.json(results);
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { nr_inmatriculare } = req.body;
  const userId = req.user.id;
  const asigurare_exp = toMysqlDate(req.body.asigurare_exp);
  const itp_exp = toMysqlDate(req.body.itp_exp);
  const rovinieta_exp = toMysqlDate(req.body.rovinieta_exp);

  if (!nr_inmatriculare || !asigurare_exp || !itp_exp || !rovinieta_exp) {
    return res.status(400).json({ message: 'Toate câmpurile sunt necesare.' });
  }

  const sqlInsert = `
    INSERT INTO vehicule (nr_inmatriculare, asigurare_exp, itp_exp, rovinieta_exp, user_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  req.db.query(sqlInsert, [nr_inmatriculare, asigurare_exp, itp_exp, rovinieta_exp, userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Eroare la inserare vehicul.' });
    res.status(201).json({ message: 'Vehicul adăugat cu succes!', id: result.insertId });
  });
});

router.put('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const { nr_inmatriculare } = req.body;
  const asigurare_exp = toMysqlDate(req.body.asigurare_exp);
  const itp_exp = toMysqlDate(req.body.itp_exp);
  const rovinieta_exp = toMysqlDate(req.body.rovinieta_exp);

  if (!nr_inmatriculare || !asigurare_exp || !itp_exp || !rovinieta_exp) {
    return res.status(400).json({ message: 'Toate câmpurile sunt necesare.' });
  }

  req.db.query('SELECT * FROM vehicule WHERE id = ? AND user_id = ?', [id, userId], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'Vehicul inexistent.' });

    const currentVehicul = results[0];

    saveToHistory(req.db, currentVehicul, userId, (err2) => {
      if (err2) return res.status(500).json({ message: 'Eroare salvare istoric.' });

      const sqlUpdate = `
        UPDATE vehicule
        SET nr_inmatriculare = ?, asigurare_exp = ?, itp_exp = ?, rovinieta_exp = ?
        WHERE id = ? AND user_id = ?
      `;

      req.db.query(sqlUpdate, [nr_inmatriculare, asigurare_exp, itp_exp, rovinieta_exp, id, userId], (err3, result) => {
        if (err3 || result.affectedRows === 0)
          return res.status(500).json({ message: 'Actualizare eșuată.' });
        res.json({ message: 'Vehicul actualizat cu succes!' });
      });
    });
  });
});

router.delete('/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const sql = 'DELETE FROM vehicule WHERE id = ? AND user_id = ?';

  req.db.query(sql, [id, userId], (err, result) => {
    if (err || result.affectedRows === 0) return res.status(404).json({ message: 'Vehicul inexistent.' });
    res.json({ message: 'Vehicul șters cu succes!' });
  });
});

router.post('/:id/poza', authenticateToken, upload.single('poza'), (req, res) => {
  const vehiculId = req.params.id;
  const userId = req.user.id;
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'Nicio poză trimisă.' });

  const sqlSelect = 'SELECT filename FROM vehicul_photos WHERE vehicul_id = ? AND user_id = ?';
  req.db.query(sqlSelect, [vehiculId, userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Eroare la verificare DB.' });

    const oldFile = results[0]?.filename;
    const oldPath = oldFile ? path.join(__dirname, '../uploads', oldFile) : null;

    const saveNew = () => {
      const sqlQuery = results.length > 0
        ? 'UPDATE vehicul_photos SET filename = ? WHERE vehicul_id = ? AND user_id = ?'
        : 'INSERT INTO vehicul_photos (filename, vehicul_id, user_id) VALUES (?, ?, ?)';

      const values = [file.filename, vehiculId, userId];

      req.db.query(sqlQuery, values, (err2) => {
        if (err2) return res.status(500).json({ message: 'Eroare salvare DB.' });
        res.json({ message: 'Poză salvată cu succes.' });
      });
    };

    if (oldFile && fs.existsSync(oldPath)) {
      fs.unlink(oldPath, (fsErr) => {
        if (fsErr && fsErr.code !== 'ENOENT') console.warn('Nu s-a putut șterge poza veche:', fsErr);
        saveNew();
      });
    } else {
      saveNew();
    }
  });
});

router.delete('/:id/poza', authenticateToken, (req, res) => {
  const vehiculId = req.params.id;
  const userId = req.user.id;

  const sqlSelect = 'SELECT filename FROM vehicul_photos WHERE vehicul_id = ? AND user_id = ?';
  req.db.query(sqlSelect, [vehiculId, userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Eroare la interogarea bazei de date.' });
    if (results.length === 0) return res.status(404).json({ message: 'Poză inexistentă.' });

    const filename = results[0].filename;
    const filePath = path.join(__dirname, '../uploads', filename);


    fs.unlink(filePath, (fsErr) => {
      if (fsErr && fsErr.code !== 'ENOENT') {
        console.error('Eroare la ștergerea fișierului:', fsErr);
        return res.status(500).json({ message: 'Eroare la ștergerea fișierului.' });
      }


      const sqlDelete = 'DELETE FROM vehicul_photos WHERE vehicul_id = ? AND user_id = ?';
      req.db.query(sqlDelete, [vehiculId, userId], (deleteErr) => {
        if (deleteErr) return res.status(500).json({ message: 'Eroare la ștergerea din baza de date.' });
        res.json({ message: 'Poză ștearsă cu succes!' });
      });
    });
  });
});


router.get('/:id/poza', authenticateToken, (req, res) => {
  const vehiculId = req.params.id;
  const userId = req.user.id;

  const sql = 'SELECT filename FROM vehicul_photos WHERE vehicul_id = ? AND user_id = ?';
  req.db.query(sql, [vehiculId, userId], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'Poză inexistentă.' });

    res.json({ filename: results[0].filename });
  });
});

module.exports = router;
