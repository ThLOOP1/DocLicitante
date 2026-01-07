import * as admin from 'firebase-admin';

// Singleton pattern para evitar múltiplas inicializações
let app: admin.app.App | null = null;

/**
 * Inicializa o Firebase Admin SDK
 * Usa variáveis de ambiente para credenciais (não arquivo JSON)
 */
function initializeFirebaseAdmin() {
    if (app) {
        return app;
    }

    try {
        // Verificar se já existe uma instância inicializada
        if (admin.apps.length > 0) {
            app = admin.apps[0];
            console.log('✅ Firebase Admin já inicializado (reutilizando instância)');
            return app;
        }

        // Validar variáveis de ambiente
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (!projectId || !clientEmail || !privateKey) {
            throw new Error(
                'Variáveis de ambiente do Firebase Admin não configuradas. ' +
                'Configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY'
            );
        }

        // Inicializar Firebase Admin
        app = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                // A private key vem com \n escapado como \\n, precisamos converter
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
            storageBucket: `${projectId}.appspot.com`,
        });

        console.log('✅ Firebase Admin inicializado com sucesso');
        return app;
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase Admin:', error);
        throw error;
    }
}

// Inicializar e exportar instâncias
const firebaseApp = initializeFirebaseAdmin();
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;

export default firebaseApp;
