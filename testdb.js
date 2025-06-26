const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Aa21fea0',
  database: 'firma_transport'
});

db.connect(err => {
  if (err) {
    return console.error('Eroare DB:', err);
  }
  console.log('Conectat la DB cu succes!');
  db.end();
});
