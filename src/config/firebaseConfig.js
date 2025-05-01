const admin = require("firebase-admin");
const key = require("../../key.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(key),
});

// Export the initialized Firebase Admin SDK instance
module.exports = admin;
