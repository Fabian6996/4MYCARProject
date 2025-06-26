const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const trimiteEmail = (to, subiect, continut) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject: subiect,
    text: continut,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = trimiteEmail;
