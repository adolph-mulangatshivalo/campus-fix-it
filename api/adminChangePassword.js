let appModule, authModule;
let initializationError = null;

try {
  appModule = require('firebase-admin/app');
  authModule = require('firebase-admin/auth');

  if (appModule.getApps().length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        appModule.initializeApp({
          credential: appModule.cert(serviceAccount)
        });
    }
  }
} catch (error) {
  initializationError = error.message;
  console.error("Initialization Error:", error);
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

  if (initializationError) {
    return res.status(500).json({ error: `Module Load Error: ${initializationError}` });
  }

  if (appModule.getApps().length === 0) {
    return res.status(500).json({ error: 'Server misconfiguration: FIREBASE_SERVICE_ACCOUNT is missing' });
  }

  try {
    const auth = authModule.getAuth();

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
