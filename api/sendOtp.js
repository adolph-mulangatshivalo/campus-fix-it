const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        initializeApp({
          credential: cert(serviceAccount)
        });
    }
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
  }
}

module.exports = async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing required field: email' });
  }

  if (getApps().length === 0) {
    return res.status(500).json({ error: 'Server misconfiguration: FIREBASE_SERVICE_ACCOUNT is missing' });
  }

  try {
    const db = getFirestore();

    // 1. Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes from now

    // 2. Save to Firestore securely via Admin SDK (bypasses security rules)
    await db.collection("password_resets").add({
        email: email,
        otp: otpCode,
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: FieldValue.serverTimestamp()
    });

    // 3. Send Email using EmailJS REST API
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY; // Optional but recommended for REST API

    if (!serviceId || !templateId || !publicKey) {
      return res.status(500).json({ error: 'Server misconfiguration: EmailJS environment variables missing' });
    }

    const emailjsPayload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: email,
        otp_code: otpCode,
        reply_to: "no-reply@campusfixit.com"
      }
    };

    if (privateKey) {
        emailjsPayload.accessToken = privateKey;
    }

    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailjsPayload)
    });

    if (!emailResponse.ok) {
      const text = await emailResponse.text();
      console.error("EmailJS Error:", text);
      return res.status(500).json({ error: 'Failed to send email via EmailJS' });
    }

    return res.status(200).json({ success: true, message: 'OTP generated and sent securely.' });

  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
