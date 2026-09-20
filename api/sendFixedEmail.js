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

export default async function handler(req, res) {
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

  const { reportId } = req.body;

  if (!reportId) {
    return res.status(400).json({ error: 'Missing required field: reportId' });
  }

  if (!admin.apps.length) {
    return res.status(500).json({ error: 'Server misconfiguration: FIREBASE_SERVICE_ACCOUNT is missing' });
  }

  try {
    const db = admin.firestore();
    const auth = admin.auth();

    // 1. Get Report Details
    const reportDoc = await db.collection('reports').doc(reportId).get();
    if (!reportDoc.exists) {
        return res.status(404).json({ error: 'Report not found' });
    }
    
    const reportData = reportDoc.data();
    const studentId = reportData.student_id;
    const title = reportData.title || "Your Issue";

    if (!studentId) {
        return res.status(400).json({ error: 'Report has no associated student_id' });
    }

    // 2. Get Student Email
    let studentEmail;
    try {
        const userRecord = await auth.getUser(studentId);
        studentEmail = userRecord.email;
    } catch(e) {
        return res.status(404).json({ error: 'Student user not found in Auth' });
    }

    if (!studentEmail) {
        return res.status(400).json({ error: 'Student has no email address' });
    }

    // 3. Send Email using EmailJS REST API
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_FIXED_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY; 

    if (!serviceId || !templateId || !publicKey) {
      return res.status(500).json({ error: 'Server misconfiguration: EmailJS environment variables missing' });
    }

    const emailjsPayload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: studentEmail,
        report_title: title,
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

    return res.status(200).json({ success: true, message: 'Issue Fixed email sent successfully.' });

  } catch (error) {
    console.error('Send Fixed Email Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
