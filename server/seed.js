const admin = require('firebase-admin');

// Inicialização do Firebase Admin
try {
    const serviceAccount = require('./serviceAccountKey.json');
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} catch (error) {
    console.error('Erro ao carregar serviceAccountKey.json:', error.message);
    process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

async function seedUser() {
    const userData = {
        nome: "Thiago Luan",
        email: "tf16092002@gmail.com",
        cpf: "61795784350",
        pais: "Brasil",
        role: "admin",
        password: "password123" // Definindo para uso manual caso precise
    };

    try {
        let uid = "thiago-luan-temp-id"; // ID temporário caso Auth falhe

        try {
            // Tentar registrar no Authentication
            let userRecord;
            try {
                userRecord = await auth.getUserByEmail(userData.email);
                uid = userRecord.uid;
                console.log(`Usuário ${userData.email} já existe no Authentication.`);
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    userRecord = await auth.createUser({
                        email: userData.email,
                        password: userData.password,
                        displayName: userData.nome
                    });
                    uid = userRecord.uid;
                    console.log(`Usuário ${userData.email} criado no Authentication.`);
                } else {
                    throw error;
                }
            }
        } catch (authError) {
            console.warn('AVISO: Não foi possível acessar o Firebase Authentication. Verifique se ele está ativado no Console.');
            console.log('Tentando criar o registro apenas no Firestore...');
        }

        // Salvar/Atualizar dados no Firestore
        await db.collection('usuarios').doc(uid).set({
            ...userData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`Sucesso: Usuário "${userData.nome}" está pronto no Firestore.`);
        process.exit(0);
    } catch (error) {
        console.error('Erro crítico no seed:', error.message);
        process.exit(1);
    }
}

seedUser();
