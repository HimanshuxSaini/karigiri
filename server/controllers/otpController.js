const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

// Configure SMTP Transporter with Port 465 (SSL)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error.message);
  } else {
    console.log('SMTP Server: ✅ Ready');
  }
});

exports.sendOtp = async (req, res) => {
  try {
    const db = admin.firestore();
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to Firestore (otps collection)
    await db.collection('otps').doc(email).set({
      otp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send Email
    const mailOptions = {
      from: `"Karigiri" <${process.env.SMTP_USER}>`,
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

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

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

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};
