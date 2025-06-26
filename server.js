const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const vehiculeRoutes = require('./routes/vehicule');
const vehiculeHistoryRoutes = require('./routes/vehiculeHistory');


const authenticateToken = require('./middleware/authMiddleware');
const startCron = require('./cron');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Aa21fea0',
  database: 'firma_transport',

});

db.connect(err => {
  if (err) {
    console.error('Eroare la conectarea la baza de date:', err);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    
  } else {
    console.log('Conectat la baza de date MySQL.');
    startCron(db);
  }
});


app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use('/auth', authRoutes);
app.use('/vehicule', vehiculeRoutes);
app.use('/vehicule', vehiculeHistoryRoutes);



module.exports = app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Serverul rulează pe portul ${port}`);
  });
}
