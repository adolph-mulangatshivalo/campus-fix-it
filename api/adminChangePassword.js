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

  const { uid, newPassword } = req.body;

  if (!uid || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!admin.apps.length) {
    return res.status(500).json({ error: 'Server misconfiguration: FIREBASE_SERVICE_ACCOUNT is missing' });
  }

  try {
    const auth = admin.auth();

    // Force update the user's password using the Admin SDK
    await auth.updateUser(uid, {
        password: newPassword
    });

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });

  } catch (error) {
    console.error('Admin Change Password Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
