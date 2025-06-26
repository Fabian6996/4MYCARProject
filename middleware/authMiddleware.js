
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token lipsă' });
  }

  const JWT_SECRET = 'secret123';
  jwt.verify(token, JWT_SECRET, (err, user) => {  
    if (err) {
      return res.status(403).json({ message: 'Token invalid sau expirat' });
    }

    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
