const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

// Helper to send email via Brevo REST API or fallback to SMTP
const sendEmail = async (mailOptions) => {
  const isBrevo = process.env.SMTP_HOST && process.env.SMTP_HOST.includes('brevo');
  
  if (isBrevo) {
    console.log('Using Brevo REST API over Port 443 to bypass Render SMTP blocks');
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.SMTP_PASS, // Brevo SMTP pass is the API key
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Karigiri',
          email: process.env.SMTP_FROM_EMAIL || 'hello@karigiri.com'
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
    console.log('Using fallback Nodemailer SMTP');
    return await transporter.sendMail(mailOptions);
  }
};

// Configure SMTP Transporter with Port 465 (SSL) and Connection Pooling
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: (process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT), // True for 465, false for 587
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
transporter.verify(function (error, success) {
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
});exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ message: 'Email is required' });

    console.log(`Starting OTP process for: ${email}`);
    const db = admin.firestore();
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to Firestore with a timeout
    console.log(`Step 1: Saving OTP to Firestore for ${email}`);
    const savePromise = db.collection('otps').doc(email).set({
      otp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore operation timed out. Check your Firebase credentials/connection.')), 10000)
    );

    await Promise.race([savePromise, timeoutPromise]);
    console.log(`Step 2: Firestore Save Successful`);

    // Send Email
    const mailOptions = {
      from: `"Karigiri" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Login OTP for Karigiri',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; padding: 40px; background-color: #fcfcfc; border: 1px solid #eee; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #5C4033; margin: 0; font-size: 28px; letter-spacing: 2px;">KARIGIRI</h1>
            <p style="color: #A0522D; font-size: 12px; text-transform: uppercase; letter-spacing: 4px; margin-top: 5px;">Handcrafted Excellence</p>
          </div>
          <p style="color: #333; font-size: 16px;">Welcome back!</p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">Use the verification code below to sign in to your Karigiri account.</p>
          <div style="background: #fdf5e6; padding: 30px; text-align: center; border-radius: 15px; margin: 30px 0; border: 1px dashed #d2b48c;">
            <h1 style="color: #5C4033; letter-spacing: 8px; margin: 0; font-size: 36px; font-weight: 800;">${otp}</h1>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">This code expires in 5 minutes. If you didn't request this, you can safely ignore this email.</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #5C4033; font-weight: bold; font-size: 14px; margin: 0;">Preserving Heritage, One Stitch at a Time.</p>
          </div>
        </div>
      `,
    };

    console.log(`Step 3: Attempting to send SMTP email to: ${email}`);
    const info = await sendEmail(mailOptions);
    console.log('Step 4: OTP Email Sent Successfully:', info.messageId);
    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP Controller Failure:', error);
    res.status(500).json({ 
      message: 'Failed to send OTP', 
      error: error.message,
      code: error.code
    });
  }
};
;

exports.verifyOtp = async (req, res) => {
  try {
    const db = admin.firestore();
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const otpDoc = await db.collection('otps').doc(email).get();

    if (!otpDoc.exists) {
      return res.status(400).json({ success: false, message: 'OTP not found or expired' });
    }

    const data = otpDoc.data();
    
    // Check if OTP matches
    if (data.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Check expiry (5 minutes)
    const now = Date.now();
    const created = data.createdAt.toDate().getTime();
    
    if (now - created > 5 * 60 * 1000) {
      await db.collection('otps').doc(email).delete();
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Delete after use
    await db.collection('otps').doc(email).delete();

    // Create Firebase custom token
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        userRecord = await admin.auth().createUser({ email });
      } else {
        throw e;
      }
    }

    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    res.status(200).json({ success: true, message: 'OTP verified successfully', token: customToken });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Generate Firebase Password Reset Link
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    // Send via SMTP
    const mailOptions = {
      from: `"Karigiri Support" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your Karigiri Password',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; padding: 40px; background-color: #fcfcfc; border: 1px solid #eee; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #5C4033; margin: 0; font-size: 28px; letter-spacing: 2px;">KARIGIRI</h1>
            <p style="color: #A0522D; font-size: 12px; text-transform: uppercase; letter-spacing: 4px; margin-top: 5px;">Handcrafted Excellence</p>
          </div>
          <p style="color: #333; font-size: 16px;">Hello,</p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">We received a request to reset your password for your Karigiri account. Click the button below to proceed.</p>
          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetLink}" style="background-color: #5C4033; color: white; padding: 15px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 15px rgba(92, 64, 51, 0.2);">RESET PASSWORD</a>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this, you can safely ignore this email. This link will expire shortly.</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #5C4033; font-weight: bold; font-size: 14px; margin: 0;">Preserving Heritage, One Stitch at a Time.</p>
          </div>
        </div>
      `,
    };

    await sendEmail(mailOptions);
    res.status(200).json({ success: true, message: 'Reset link sent to your email' });
  } catch (error) {
    console.error('Error sending reset link:', error);
    res.status(500).json({ message: 'Failed to send reset link', error: error.message });
  }
};
