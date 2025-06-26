const nodemailer = require('nodemailer');
const cron = require('node-cron');

module.exports = function startCron(db) {
  
  function getDatePlusDays(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10); 
  }

  
  function verificaSiTrimiteNotificari(daysBeforeExpiration) {
    console.log(`🕒 Pornesc verificarea documentelor care expiră în ${daysBeforeExpiration} zi(e)...`);

    const dataCheck = getDatePlusDays(daysBeforeExpiration);
    console.log(`📅 Data verificare: ${dataCheck}`);

    const query = `
      SELECT v.nr_inmatriculare, u.email AS utilizator_email, 'asigurare' AS tip_document, v.asigurare_exp AS data_expirare
      FROM vehicule v
      JOIN users u ON v.user_id = u.id
      WHERE DATE(v.asigurare_exp) = ?

      UNION ALL

      SELECT v.nr_inmatriculare, u.email AS utilizator_email, 'itp' AS tip_document, v.itp_exp AS data_expirare
      FROM vehicule v
      JOIN users u ON v.user_id = u.id
      WHERE DATE(v.itp_exp) = ?

      UNION ALL

      SELECT v.nr_inmatriculare, u.email AS utilizator_email, 'rovinieta' AS tip_document, v.rovinieta_exp AS data_expirare
      FROM vehicule v
      JOIN users u ON v.user_id = u.id
      WHERE DATE(v.rovinieta_exp) = ?
    `;

    db.query(query, [dataCheck, dataCheck, dataCheck], (err, results) => {
      if (err) {
        console.error('❌ Eroare MySQL:', err);
        return;
      }

      if (results.length === 0) {
        console.log(`ℹ️ Nu s-au găsit documente care expiră în ${daysBeforeExpiration} zi(e).`);
        return;
      }

      console.log(`🔍 Găsite ${results.length} documente care expiră în ${daysBeforeExpiration} zi(e).`);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      results.forEach(({ nr_inmatriculare, utilizator_email, tip_document, data_expirare }) => {
        const zileText = daysBeforeExpiration === 1 ? 'mâine' : `peste ${daysBeforeExpiration} zile`;
        const mailOptions = {
          from: process.env.MAIL_USER,
          to: utilizator_email,
          subject: `Atenție! Document ${tip_document.toUpperCase()} pentru vehicul ${nr_inmatriculare} expiră ${zileText}`,
          text: `Salut!\n\nDocumentul de tip ${tip_document} pentru vehiculul cu numărul de înmatriculare ${nr_inmatriculare} expiră ${zileText}, pe data de ${data_expirare}.\nTe rugăm să îl reînnoiești la timp.\n\nMulțumim!`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(`❌ Eroare la trimiterea mailului către ${utilizator_email}:`, error);
          } else {
            console.log(`✅ Mail trimis către ${utilizator_email} pentru vehiculul ${nr_inmatriculare} (${tip_document}) - notificare ${daysBeforeExpiration} zi(e) înainte`);
          }
        });
      });
    });
  }

  
  cron.schedule('0 8 * * *', () => {
    console.log('🔁 Programare cron activată (ora 08:00 în fiecare zi)');
    [7, 3, 1].forEach(days => verificaSiTrimiteNotificari(days));
  });

  // test
  [7, 3, 1].forEach(days => verificaSiTrimiteNotificari(days));
};
