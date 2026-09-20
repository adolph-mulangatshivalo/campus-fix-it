let appModule, firestoreModule;
let initializationError = null;

try {
  appModule = require('firebase-admin/app');
  firestoreModule = require('firebase-admin/firestore');

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
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const { email } = body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  if (initializationError) {
    return res.status(500).json({ error: `Module Load Error: ${initializationError}` });
  }

  try {
    const db = firestoreModule.getFirestore();
    const snapshot = await db.collection("password_resets").where("email", "==", email).get();
    
    if (!snapshot.empty) {
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    }

    return res.status(200).json({ success: true, message: 'OTP cleaned up successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
