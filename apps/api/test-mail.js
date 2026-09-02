const nodemailer = require('nodemailer');

async function test() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'ubendiran2007@gmail.com',
      pass: 'tvzxjofagbacnvkx',
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"Amman Communications" <ubendiran2007@gmail.com>',
      to: 'ubendiran.l2024cse@sece.ac.in',
      subject: 'Amman Communications - Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email</h2>
          <p>This is a test email sent from the Amman Communications backend to verify SMTP configuration.</p>
          <p>If you see this, the App Password is working!</p>
        </div>
      `,
    });
    console.log('Success! MessageId:', info.messageId);
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}

test();
