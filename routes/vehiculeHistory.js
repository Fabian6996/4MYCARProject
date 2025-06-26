const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');


router.get('/:id/history', authenticateToken, (req, res) => {
  const vehiculId = req.params.id;
  const userId = req.user.id;  

  const sql = `
    SELECT nr_inmatriculare, asigurare_exp, itp_exp, rovinieta_exp, modified_at 
    FROM vehicule_history 
    WHERE vehicul_id = ? AND user_id = ?
    ORDER BY modified_at DESC
  `;

  req.db.query(sql, [vehiculId, userId], (err, results) => {
    if (err) {
      console.error('Eroare la extragere istoric:', err);
      return res.status(500).json({ message: 'Eroare server.' });
    }
    res.json(results);
  });
});

module.exports = router;
