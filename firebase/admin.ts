import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore";

const initFirebaseAdmin = () => {
    const apps = getApps()

    if (!apps.length) {
        // Validate required environment variables
        const requiredEnvVars = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY,
        };

        const missingVars = Object.entries(requiredEnvVars)
            .filter(([, value]) => !value)
            .map(([key]) => key);

        if (missingVars.length > 0) {
            throw new Error(`Missing required Firebase Admin environment variables: ${missingVars.join(', ')}`);
        }

        console.log('Initializing Firebase Admin with project:', requiredEnvVars.projectId);
        
        initializeApp({
            credential: cert({
                projectId: requiredEnvVars.projectId,
                clientEmail: requiredEnvVars.clientEmail,
                privateKey: requiredEnvVars.privateKey.replace(/\\n/g, '\n'),
            }),
            databaseURL: `https://${requiredEnvVars.projectId}.firebaseio.com`
        })
    }
    return {
         auth: getAuth(),
         db: getFirestore(),
    }
}

export const { auth, db } = initFirebaseAdmin();

