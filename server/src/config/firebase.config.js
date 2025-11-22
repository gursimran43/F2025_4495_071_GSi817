const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// In production, use a service account key file
// For development, you can use environment variables or a service account JSON
let firebaseAdmin;

try {
  // Try to initialize with service account credentials from environment
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (serviceAccount) {
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Fallback to default credentials (useful for local development)
    console.log('⚠️  No Firebase service account found. Using default credentials.');
    firebaseAdmin = admin.initializeApp();
  }

  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
}

module.exports = { admin, firebaseAdmin };
