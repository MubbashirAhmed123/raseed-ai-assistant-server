// src/lib/firebase-admin.ts

import admin from "firebase-admin";
import serviceAccount from "../../raseed-app.json";

// Use env variable or secure service account file
// const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS || "{}");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export { admin };
