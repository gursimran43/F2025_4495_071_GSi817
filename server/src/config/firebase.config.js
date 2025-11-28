const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// In production, use a service account key file
// For development, you can use environment variables or a service account JSON
let firebaseAdmin = null;

try {
  // Try to initialize with service account credentials from environment
  if (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT.trim()) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized successfully');
    } catch (parseError) {
      console.log('⚠️  Firebase service account JSON is invalid. Firebase 2FA will be unavailable.');
      console.log('   Tip: For testing, use password "979797" to bypass 2FA');
    }
  } else {
    console.log('⚠️  No Firebase service account configured. Firebase 2FA will be unavailable.');
    console.log('   Tip: For testing, use password "979797" to bypass 2FA');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  console.log('   Tip: For testing, use password "979797" to bypass 2FA');
}

module.exports = { admin, firebaseAdmin };
