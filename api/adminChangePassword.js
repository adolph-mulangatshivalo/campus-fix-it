const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

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

  const body = req.body || {};
  const { uid, newPassword } = body;

  if (!uid || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (getApps().length === 0) {
    return res.status(500).json({ error: 'Server misconfiguration: FIREBASE_SERVICE_ACCOUNT is missing' });
  }

  try {
    const auth = getAuth();

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
