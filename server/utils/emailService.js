const nodemailer = require('nodemailer');

// Configure SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT) || 2525,
  secure: false, // True for 465, false for 587 and 2525
  pool: true,
  family: 4, // Force IPv4 to avoid IPv6 resolution timeouts on Render
  maxConnections: 3,
  maxMessages: 50,
  connectionTimeout: 20000, 
  greetingTimeout: 20000,
  socketTimeout: 30000,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  }
});

// Verify connection configuration with better logging
transporter.verify(function (error) {
  if (error) {
    console.error('❌ SMTP Connection Error Details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      port: process.env.SMTP_PORT || 465
    });
  } else {
    console.log('✅ SMTP Server Ready (Port:', process.env.SMTP_PORT || 465, ')');
  }
});

// Helper to send email via Brevo REST API or fallback to SMTP
const sendEmail = async (mailOptions) => {
  const isBrevoApi = process.env.SMTP_HOST && process.env.SMTP_HOST.includes('brevo') && process.env.SMTP_PASS && process.env.SMTP_PASS.startsWith('xkeysib-');
  
  if (isBrevoApi) {
    console.log('Using Brevo REST API over Port 443 to bypass Render SMTP blocks');
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.SMTP_PASS, // Brevo REST API key
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'PrathamKarigiri',
          email: process.env.SMTP_FROM_EMAIL || 'hello@prathamkarigiri.com'
        },
        to: [{ email: mailOptions.to }],
        subject: mailOptions.subject,
        htmlContent: mailOptions.html
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brevo API Error:', errorText);
      throw new Error(`Brevo HTTP API failed: ${errorText}`);
    }
    const data = await response.json();
    return { messageId: data.messageId };
  } else {
    console.log(`Using fallback Nodemailer SMTP. Port: ${process.env.SMTP_PORT || 2525}`);
    // If not using API, send using the Nodemailer transporter
    const defaultFrom = `"PrathamKarigiri" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`;
    return await transporter.sendMail({
      from: mailOptions.from || defaultFrom,
      ...mailOptions
    });
  }
};

module.exports = { sendEmail };
