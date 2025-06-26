const trimiteEmail = require('./utils/emailTrimite');

async function testEmail() {
  try {
    await trimiteEmail(
      'felzer.flavius.fabian@gmail.com',
      'Test email din aplicație',
      'Acesta este un email de test trimis din aplicația ta.'
    );
    console.log('✅ Email trimis cu succes!');
  } catch (error) {
    console.error('❌ Eroare la trimiterea emailului:', error);
  }
}

testEmail();
