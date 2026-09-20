const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
    }
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
  }
}

module.exports = async function handler(req, res) {
  // CORS setup for local testing and Vercel
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

  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!admin.apps.length) {
    return res.status(500).json({ error: 'Server misconfiguration: FIREBASE_SERVICE_ACCOUNT is missing or invalid' });
  }

  try {
    const db = admin.firestore();
    const auth = admin.auth();

    // 1. Verify OTP in Firestore
    const resetsRef = db.collection('password_resets');
    const snapshot = await resetsRef
      .where('email', '==', email)
      .where('otp', '==', otp.toString())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Check expiration
    if (data.expiresAt.toDate() < new Date()) {
      await doc.ref.delete();
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // 2. Get User UID by Email
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (e) {
      return res.status(404).json({ error: 'User not found in Firebase Auth.' });
    }

    // 3. Update Password
    await auth.updateUser(userRecord.uid, {
      password: newPassword
    });

    // 4. Delete the OTP document so it cannot be reused
    await doc.ref.delete();

    return res.status(200).json({ success: true, message: 'Password reset successfully.' });

  } catch (error) {
    console.error('Password Reset Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
