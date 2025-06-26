// __tests__/cron.test.js
const nodemailer = require('nodemailer');
const { verificaSiTrimiteNotificari } = require('../cron');

jest.mock('nodemailer');

describe('verificaSiTrimiteNotificari', () => {
  let mockQuery;
  let mockSendMail;
  let mockTransporter;

  beforeEach(() => {
    mockSendMail = jest.fn((mailOptions, cb) => cb(null, { response: '250 OK' }));
    mockTransporter = { sendMail: mockSendMail };
    nodemailer.createTransport.mockReturnValue(mockTransporter);
  });

  it('trimite mailuri pentru rezultate din baza de date', done => {
    const fakeResults = [
      { nr_inmatriculare: 'B123ABC', utilizator_email: 'test1@example.com', tip_document: 'asigurare', data_expirare: '2025-06-25' },
      { nr_inmatriculare: 'B456DEF', utilizator_email: 'test2@example.com', tip_document: 'itp', data_expirare: '2025-06-25' }
    ];

    const mockDb = { query: (query, params, cb) => cb(null, fakeResults) };

    verificaSiTrimiteNotificari(mockDb, 3);

    setImmediate(() => {
      expect(mockSendMail).toHaveBeenCalledTimes(fakeResults.length);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'test1@example.com', subject: expect.stringContaining('ASIGURARE') }),
        expect.any(Function)
      );
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'test2@example.com', subject: expect.stringContaining('ITP') }),
        expect.any(Function)
      );
      done();
    });
  });
  function startCron(db) {
    cron.schedule('0 8 * * *', () => {
      console.log('🔁 Programare cron activată (ora 08:00 în fiecare zi)');
      [7, 3, 1].forEach(days => verificaSiTrimiteNotificari(db, days));
    });}

  it('nu trimite mailuri dacă nu sunt rezultate', done => {
    const mockDb = { query: (q, p, cb) => cb(null, []) };
    verificaSiTrimiteNotificari(mockDb, 1);
    setImmediate(() => {
      expect(mockSendMail).not.toHaveBeenCalled();
      done();
    });
  });
});
