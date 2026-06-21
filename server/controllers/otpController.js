const admin = require('firebase-admin');
const { sendEmail } = require('../utils/emailService');

exports.sendOtp = async (req, res) => {
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
      from: `"PrathamKarigiri" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Login OTP for PrathamKarigiri',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; padding: 40px; background-color: #fcfcfc; border: 1px solid #eee; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #5C4033; margin: 0; font-size: 28px; letter-spacing: 2px;">PrathamKarigiri</h1>
            <p style="color: #A0522D; font-size: 12px; text-transform: uppercase; letter-spacing: 4px; margin-top: 5px;">Handcrafted Excellence</p>
          </div>
          <p style="color: #333; font-size: 16px;">Welcome back!</p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">Use the verification code below to sign in to your PrathamKarigiri account.</p>
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
      message: 'Failed to send OTP. Please try again later.'
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
      from: `"PrathamKarigiri Support" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your PrathamKarigiri Password',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; padding: 40px; background-color: #fcfcfc; border: 1px solid #eee; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #5C4033; margin: 0; font-size: 28px; letter-spacing: 2px;">PrathamKarigiri</h1>
            <p style="color: #A0522D; font-size: 12px; text-transform: uppercase; letter-spacing: 4px; margin-top: 5px;">Handcrafted Excellence</p>
          </div>
          <p style="color: #333; font-size: 16px;">Hello,</p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">We received a request to reset your password for your PrathamKarigiri account. Click the button below to proceed.</p>
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
