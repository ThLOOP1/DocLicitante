/**
 * Script de Migração de UIDs
 * 
 * Este script atualiza empresas com IDs manuais (ex: thiago-luan-temp-id)
 * para usar os UIDs reais do Firebase Auth
 * 
 * ATENÇÃO: Execute este script apenas UMA VEZ após verificar os dados!
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrarUIDs() {
    console.log('🔄 Iniciando migração de UIDs...\n');

    try {
        // 1. Buscar todas as empresas
        const empresasSnapshot = await db.collection('empresas').get();
        console.log(`📦 Encontradas ${empresasSnapshot.size} empresas no total\n`);

        let migradas = 0;
        let erros = 0;
        let jaCorretas = 0;

        for (const empresaDoc of empresasSnapshot.docs) {
            const empresa = empresaDoc.data();
            const empresaId = empresaDoc.id;
            const donoUid = empresa.donoUid;

            console.log(`\n📋 Processando empresa: ${empresa.razaoSocial}`);
            console.log(`   ID: ${empresaId}`);
            console.log(`   donoUid atual: ${donoUid}`);

            // Verificar se donoUid parece ser um ID manual
            const isManualId = !donoUid.match(/^[a-zA-Z0-9]{20,}$/) || donoUid.includes('-');

            if (!isManualId) {
                console.log(`   ✅ UID já parece correto (Firebase Auth format)`);
                jaCorretas++;
                continue;
            }

            console.log(`   ⚠️  UID parece ser manual, tentando migrar...`);

            // 2. Tentar encontrar usuário pelo email da empresa
            let novoUID = null;

            // Opção 1: Buscar pelo email do contato da empresa
            if (empresa.contato?.email) {
                console.log(`   🔍 Buscando usuário por email: ${empresa.contato.email}`);

                const userSnapshot = await db.collection('usuarios')
                    .where('email', '==', empresa.contato.email)
                    .get();

                if (!userSnapshot.empty) {
                    novoUID = userSnapshot.docs[0].id;
                    console.log(`   ✅ Usuário encontrado! Novo UID: ${novoUID}`);
                } else {
                    console.log(`   ❌ Nenhum usuário encontrado com email: ${empresa.contato.email}`);
                }
            }

            // Opção 2: Se não encontrou, tentar buscar pelo donoUid atual
            if (!novoUID) {
                console.log(`   🔍 Tentando buscar usuário com ID: ${donoUid}`);

                const userDoc = await db.collection('usuarios').doc(donoUid).get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    console.log(`   ✅ Usuário encontrado! Email: ${userData.email}`);

                    // Verificar se existe outro documento com UID do Firebase Auth
                    const authUserSnapshot = await db.collection('usuarios')
                        .where('email', '==', userData.email)
                        .get();

                    if (authUserSnapshot.size > 1) {
                        // Encontrou múltiplos usuários com mesmo email
                        // Usar o que tem UID no formato do Firebase Auth
                        for (const doc of authUserSnapshot.docs) {
                            if (doc.id.match(/^[a-zA-Z0-9]{20,}$/) && !doc.id.includes('-')) {
                                novoUID = doc.id;
                                console.log(`   ✅ Encontrado UID do Firebase Auth: ${novoUID}`);
                                break;
                            }
                        }
                    } else {
                        // Usar o ID atual mesmo
                        novoUID = donoUid;
                        console.log(`   ℹ️  Mantendo UID atual (único usuário com este email)`);
                    }
                }
            }

            // 3. Atualizar empresa com novo UID
            if (novoUID && novoUID !== donoUid) {
                console.log(`   🔄 Atualizando donoUid de ${donoUid} para ${novoUID}`);

                await db.collection('empresas').doc(empresaId).update({
                    donoUid: novoUID,
                    migratedAt: admin.firestore.FieldValue.serverTimestamp(),
                    oldDonoUid: donoUid // Guardar o antigo para referência
                });

                console.log(`   ✅ Empresa migrada com sucesso!`);
                migradas++;
            } else if (!novoUID) {
                console.log(`   ❌ Não foi possível encontrar UID válido para migração`);
                erros++;
            } else {
                console.log(`   ℹ️  UID já está correto, nenhuma ação necessária`);
                jaCorretas++;
            }
        }

        // 4. Resumo final
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMO DA MIGRAÇÃO');
        console.log('='.repeat(60));
        console.log(`✅ Empresas migradas: ${migradas}`);
        console.log(`✓  Empresas já corretas: ${jaCorretas}`);
        console.log(`❌ Erros: ${erros}`);
        console.log(`📦 Total processado: ${empresasSnapshot.size}`);
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('❌ Erro durante migração:', error);
    } finally {
        // Encerrar conexão
        await admin.app().delete();
        console.log('🏁 Migração finalizada!');
    }
}

// Executar migração
migrarUIDs();
