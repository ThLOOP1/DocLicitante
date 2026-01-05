/**
 * Script de Limpeza de Dados Duplicados
 * 
 * ATENÇÃO: Este script executa operações DESTRUTIVAS no banco de dados!
 * Execute apenas UMA VEZ e com cuidado.
 * 
 * Objetivo: Remover dados duplicados e legados para permitir novo cadastro
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// Dados a serem removidos
const EMAIL_ALVO = 'thdev.programacao@gmail.com';
const CNPJ_ALVO = '21498772000175';
const ID_LEGACY = 'thiago-luan-temp-id';

async function limparDados() {
    console.log('🧹 Iniciando limpeza de dados duplicados...\n');
    console.log('='.repeat(60));

    try {
        // ========================================
        // 1. REMOVER USUÁRIO DO FIREBASE AUTH
        // ========================================
        console.log('\n📋 ETAPA 1: Removendo usuário do Firebase Auth');
        console.log('-'.repeat(60));

        try {
            // Buscar usuário por email
            const userRecord = await auth.getUserByEmail(EMAIL_ALVO);
            console.log(`✅ Usuário encontrado no Auth:`);
            console.log(`   UID: ${userRecord.uid}`);
            console.log(`   Email: ${userRecord.email}`);
            console.log(`   Criado em: ${new Date(userRecord.metadata.creationTime).toLocaleString('pt-BR')}`);

            // Deletar do Auth
            await auth.deleteUser(userRecord.uid);
            console.log(`✅ Usuário deletado do Firebase Auth com sucesso!`);

        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log(`ℹ️  Usuário ${EMAIL_ALVO} não encontrado no Auth (já foi removido ou nunca existiu)`);
            } else {
                throw error;
            }
        }

        // ========================================
        // 2. REMOVER DOCUMENTO DO FIRESTORE (usuarios)
        // ========================================
        console.log('\n📋 ETAPA 2: Removendo documento da coleção usuarios');
        console.log('-'.repeat(60));

        const usuariosSnapshot = await db.collection('usuarios')
            .where('email', '==', EMAIL_ALVO)
            .get();

        if (!usuariosSnapshot.empty) {
            for (const doc of usuariosSnapshot.docs) {
                console.log(`✅ Documento encontrado:`);
                console.log(`   ID: ${doc.id}`);
                console.log(`   Nome: ${doc.data().nome}`);
                console.log(`   Email: ${doc.data().email}`);

                await db.collection('usuarios').doc(doc.id).delete();
                console.log(`✅ Documento deletado do Firestore!`);
            }
        } else {
            console.log(`ℹ️  Nenhum documento encontrado com email ${EMAIL_ALVO}`);
        }

        // ========================================
        // 3. REMOVER ID LEGACY (se existir)
        // ========================================
        console.log('\n📋 ETAPA 3: Removendo ID legacy');
        console.log('-'.repeat(60));

        const legacyDoc = await db.collection('usuarios').doc(ID_LEGACY).get();

        if (legacyDoc.exists) {
            console.log(`✅ Documento legacy encontrado:`);
            console.log(`   ID: ${ID_LEGACY}`);
            console.log(`   Dados:`, legacyDoc.data());

            await db.collection('usuarios').doc(ID_LEGACY).delete();
            console.log(`✅ Documento legacy deletado!`);
        } else {
            console.log(`ℹ️  Documento ${ID_LEGACY} não encontrado (já foi removido ou nunca existiu)`);
        }

        // ========================================
        // 4. REMOVER EMPRESA
        // ========================================
        console.log('\n📋 ETAPA 4: Removendo empresa');
        console.log('-'.repeat(60));

        const empresasSnapshot = await db.collection('empresas')
            .where('cnpj', '==', CNPJ_ALVO)
            .get();

        let empresaId = null;

        if (!empresasSnapshot.empty) {
            for (const doc of empresasSnapshot.docs) {
                empresaId = doc.id;
                const empresa = doc.data();

                console.log(`✅ Empresa encontrada:`);
                console.log(`   ID: ${doc.id}`);
                console.log(`   Razão Social: ${empresa.razaoSocial}`);
                console.log(`   CNPJ: ${empresa.cnpj}`);
                console.log(`   Dono UID: ${empresa.donoUid}`);

                await db.collection('empresas').doc(doc.id).delete();
                console.log(`✅ Empresa deletada do Firestore!`);
            }
        } else {
            console.log(`ℹ️  Nenhuma empresa encontrada com CNPJ ${CNPJ_ALVO}`);
        }

        // ========================================
        // 5. REMOVER DOCUMENTOS VINCULADOS
        // ========================================
        if (empresaId) {
            console.log('\n📋 ETAPA 5: Removendo documentos vinculados à empresa');
            console.log('-'.repeat(60));

            const documentosSnapshot = await db.collection('documentos')
                .where('empresaId', '==', empresaId)
                .get();

            if (!documentosSnapshot.empty) {
                console.log(`✅ Encontrados ${documentosSnapshot.size} documento(s) vinculado(s)`);

                for (const doc of documentosSnapshot.docs) {
                    const documento = doc.data();
                    console.log(`   - ${documento.nome || documento.tipo} (ID: ${doc.id})`);

                    await db.collection('documentos').doc(doc.id).delete();
                }

                console.log(`✅ Todos os documentos vinculados foram deletados!`);
            } else {
                console.log(`ℹ️  Nenhum documento vinculado encontrado`);
            }
        } else {
            console.log('\n📋 ETAPA 5: Pulando remoção de documentos (empresa não encontrada)');
        }

        // ========================================
        // RESUMO FINAL
        // ========================================
        console.log('\n' + '='.repeat(60));
        console.log('✅ LIMPEZA CONCLUÍDA COM SUCESSO!');
        console.log('='.repeat(60));
        console.log('\n📊 RESUMO:');
        console.log(`   ✓ Usuário ${EMAIL_ALVO} removido do Auth`);
        console.log(`   ✓ Documento do usuário removido do Firestore`);
        console.log(`   ✓ ID legacy ${ID_LEGACY} removido (se existia)`);
        console.log(`   ✓ Empresa CNPJ ${CNPJ_ALVO} removida`);
        console.log(`   ✓ Documentos vinculados removidos`);
        console.log('\n🎯 PRÓXIMO PASSO:');
        console.log(`   Agora você pode cadastrar novamente:`);
        console.log(`   - Email: ${EMAIL_ALVO}`);
        console.log(`   - CNPJ: ${CNPJ_ALVO}`);
        console.log('\n' + '='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ ERRO durante a limpeza:', error);
        console.error('\nDetalhes do erro:', error.message);
    } finally {
        // Encerrar conexão
        await admin.app().delete();
        console.log('🏁 Script finalizado!');
    }
}

// Executar limpeza
limparDados();
