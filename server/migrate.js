const admin = require('firebase-admin');

// Inicializar Firebase Admin (se ainda não estiver inicializado)
try {
    const serviceAccount = require('./serviceAccountKey.json');
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: `${serviceAccount.project_id}.appspot.com`
        });
    }
} catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    process.exit(1);
}

const db = admin.firestore();

async function migrarFornecedoresParaEmpresas() {
    console.log('🔄 Iniciando migração de fornecedores para empresas...\n');

    try {
        // 1. Buscar todos os documentos de 'fornecedores'
        const fornecedoresSnapshot = await db.collection('fornecedores').get();

        if (fornecedoresSnapshot.empty) {
            console.log('⚠️  Nenhum documento encontrado na coleção "fornecedores".');
            console.log('   A coleção pode estar vazia ou não existir.');
            return;
        }

        console.log(`📊 Encontrados ${fornecedoresSnapshot.size} documentos na coleção "fornecedores"\n`);

        // 2. Copiar cada documento para 'empresas'
        let sucessos = 0;
        let erros = 0;

        for (const doc of fornecedoresSnapshot.docs) {
            try {
                const data = doc.data();

                // Copiar para a nova coleção mantendo o mesmo ID
                await db.collection('empresas').doc(doc.id).set(data);

                sucessos++;
                console.log(`✅ Migrado: ${data.nome || data.razaoSocial || doc.id}`);
            } catch (error) {
                erros++;
                console.error(`❌ Erro ao migrar documento ${doc.id}:`, error.message);
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('📈 RESUMO DA MIGRAÇÃO:');
        console.log(`   ✅ Sucessos: ${sucessos}`);
        console.log(`   ❌ Erros: ${erros}`);
        console.log(`   📊 Total: ${fornecedoresSnapshot.size}`);
        console.log('='.repeat(50) + '\n');

        if (sucessos === fornecedoresSnapshot.size) {
            console.log('🎉 Migração concluída com sucesso!');
            console.log('\n⚠️  PRÓXIMOS PASSOS:');
            console.log('   1. Verifique os dados na coleção "empresas" no Firebase Console');
            console.log('   2. Teste o sistema para garantir que tudo funciona');
            console.log('   3. Quando tiver certeza, execute o script de limpeza para apagar "fornecedores"');
        } else {
            console.log('⚠️  Migração concluída com alguns erros. Revise os logs acima.');
        }

    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
        process.exit(1);
    }
}

async function apagarColecaoFornecedores() {
    console.log('🗑️  Iniciando exclusão da coleção "fornecedores"...\n');

    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        readline.question('⚠️  TEM CERTEZA que deseja APAGAR a coleção "fornecedores"? (digite "SIM" para confirmar): ', async (answer) => {
            readline.close();

            if (answer !== 'SIM') {
                console.log('❌ Operação cancelada.');
                resolve();
                return;
            }

            try {
                const snapshot = await db.collection('fornecedores').get();

                if (snapshot.empty) {
                    console.log('✅ Coleção "fornecedores" já está vazia ou não existe.');
                    resolve();
                    return;
                }

                console.log(`🗑️  Apagando ${snapshot.size} documentos...\n`);

                const batch = db.batch();
                snapshot.docs.forEach((doc) => {
                    batch.delete(doc.ref);
                });

                await batch.commit();
                console.log('✅ Coleção "fornecedores" apagada com sucesso!');

            } catch (error) {
                console.error('❌ Erro ao apagar coleção:', error);
            }

            resolve();
        });
    });
}

// Executar migração
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--delete')) {
        await apagarColecaoFornecedores();
    } else {
        await migrarFornecedoresParaEmpresas();
        console.log('\n💡 DICA: Para apagar a coleção antiga após verificar, execute:');
        console.log('   node migrate.js --delete\n');
    }

    process.exit(0);
}

main();
