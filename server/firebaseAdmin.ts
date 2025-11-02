import admin from "firebase-admin";

let app: admin.app.App;

export function initializeFirebaseAdmin() {
  if (app) {
    return app;
  }

  try {
    app = admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error: any) {
    if (error.code === 'app/duplicate-app') {
      app = admin.app();
    } else {
      console.error("Firebase Admin initialization error:", error);
      throw error;
    }
  }

  return app;
}

export function getAuth() {
  if (!app) {
    initializeFirebaseAdmin();
  }
  return admin.auth();
}
