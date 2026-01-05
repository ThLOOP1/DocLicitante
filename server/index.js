const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Inicialização do Firebase Admin
// O arquivo serviceAccountKey.json deve ser colocado nesta pasta
try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id}.appspot.com`
    });
    console.log('Firebase Admin inicializado com sucesso.');
} catch (error) {
    console.error('Erro ao carregar serviceAccountKey.json. Certifique-se de que o arquivo está na pasta /server.');
}

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();
const driveService = require('./services/driveService');

// Configuração do Multer para upload de arquivos
const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Rota de teste
app.get('/', (req, res) => {
    res.send('API DocLicitante Rodando!');
});

// --- ROTAS DE AUTENTICAÇÃO ---

// Rota de Cadastro de Usuário
app.post('/api/auth/register', async (req, res) => {
    const { nome, email, cpf, telefone, senha, pais } = req.body;

    if (!nome || !email || !cpf || !senha) {
        return res.status(400).json({ error: 'Campos obrigatórios: nome, email, cpf e senha.' });
    }

    try {
        // 1. Criar usuário no Firebase Authentication
        const userRecord = await auth.createUser({
            email,
            password: senha,
            displayName: nome,
            phoneNumber: telefone ? (telefone.startsWith('+') ? telefone : `+55${telefone.replace(/\D/g, '')}`) : undefined
        });

        // 2. Salvar dados adicionais no Firestore
        await db.collection('usuarios').doc(userRecord.uid).set({
            nome,
            email,
            cpf: cpf.replace(/\D/g, ''), // Limpar caracteres do CPF
            telefone,
            pais: pais || 'Brasil',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            role: 'user' // Nível de acesso padrão
        });

        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            uid: userRecord.uid
        });

    } catch (error) {
        console.error('Erro no cadastro:', error);

        // Tratamento específico para email duplicado
        if (error.code === 'auth/email-already-exists') {
            return res.status(409).json({
                error: 'EMAIL_DUPLICADO',
                message: 'Email já cadastrado.'
            });
        }

        // Outros erros genéricos
        res.status(500).json({ error: error.message });
    }
});

// Rota de Login (Geração de Token Temporário ou Verificação)
// Nota: No Firebase, o login geralmente é feito no frontend. 
// No backend, validamos o token enviado pelo frontend ou gerenciamos perfis.
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // Como o Express não faz login "direto" com email/senha no Firebase Admin,
    // o fluxo comum é o frontend logar e enviar o ID Token para o backend validar.
    // Mas para facilitar testes iniciais, podemos retornar os dados do usuário se ele existir.

    try {
        const userRecord = await auth.getUserByEmail(email);
        const userDoc = await db.collection('usuarios').doc(userRecord.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Usuário não encontrado no banco de dados.' });
        }

        res.json({
            uid: userRecord.uid,
            ...userDoc.data()
        });
    } catch (error) {
        res.status(401).json({ error: 'Credenciais inválidas ou usuário não encontrado.' });
    }
});

// --- ROTAS DE PERFIL ---

// Buscar Perfil do Usuário
app.get('/api/users/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
        const userDoc = await db.collection('usuarios').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        res.json({ uid: userDoc.id, ...userDoc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Atualizar Perfil do Usuário (Dados Pessoais e Endereço)
app.put('/api/users/:uid', async (req, res) => {
    const { uid } = req.params;
    const updateData = req.body;

    // Campos permitidos para atualização
    const allowedFields = [
        'nome', 'telefone', 'dataNascimento',
        'endereco', // Objeto de endereço
        'role'
    ];

    const filteredData = {};
    Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
            filteredData[key] = updateData[key];
        }
    });

    try {
        await db.collection('usuarios').doc(uid).update({
            ...filteredData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ message: 'Perfil atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ROTAS DE EMPRESAS ---

// Nova Rota: Estatísticas de Vencimento para a tela Minhas Empresas
// IMPORTANTE: Esta rota DEVE vir ANTES de /api/empresas/:id para evitar conflito
app.get('/api/empresas/vencimentos-stats', async (req, res) => {
    const { donoUid } = req.query;
    if (!donoUid) return res.status(400).json({ error: 'donoUid é obrigatório.' });

    try {
        console.log('📊 [STATS] Iniciando cálculo para donoUid:', donoUid);
        // 1. Buscar empresas do usuário
        const empresasSnapshot = await db.collection('empresas').where('donoUid', '==', donoUid).get();
        if (empresasSnapshot.empty) {
            console.log('📊 [STATS] Nenhuma empresa encontrada.');
            return res.json({ validos: 0, vencendoEmBreve: 0, vencidosPendentes: 0 });
        }

        const empresaIds = empresasSnapshot.docs.map(doc => doc.id);
        console.log('📊 [STATS] Empresa IDs:', empresaIds);

        // 2. Buscar documentos das empresas
        const docsSnapshot = await db.collection('documentos')
            .where('empresaId', 'in', empresaIds)
            .get();

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        let validos = 0;
        let vencendoEmBreve = 0;
        let vencidosPendentes = 0;

        // Processar cada empresa individualmente
        for (const empId of empresaIds) {
            const empDocs = docsSnapshot.docs
                .filter(doc => doc.data().empresaId === empId)
                .map(doc => ({ id: doc.id, ...doc.data() }));

            console.log(`📊 [STATS] Processando empresa ${empId}, ${empDocs.length} documentos encontrados`);

            // Processar todos os documentos (apenas customizados agora)
            empDocs.forEach(doc => {
                console.log(`📄 [STATS] Documento: ${doc.nome}, placeholder: ${doc.placeholder}, tem data: ${!!doc.dataVencimento}`);

                if (doc.placeholder || !doc.dataVencimento) {
                    vencidosPendentes++;
                    console.log(`  ➡️ Contado como Pendente (total: ${vencidosPendentes})`);
                } else {
                    processData(doc);
                }
            });
        }

        console.log(`📊 [STATS] RESULTADO FINAL - Válidos: ${validos}, Vencendo: ${vencendoEmBreve}, Pendentes: ${vencidosPendentes}`);

        function processData(data) {
            if (!data.dataVencimento) {
                vencidosPendentes++;
                console.log(`  ➡️ ${data.nome}: Sem data, contado como Pendente`);
                return;
            }

            const vencimento = data.dataVencimento.toDate ? data.dataVencimento.toDate() : new Date(data.dataVencimento);
            vencimento.setHours(0, 0, 0, 0);

            const diffTime = vencimento.getTime() - hoje.getTime();
            const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            console.log(`  📅 ${data.nome}: ${diasRestantes} dias restantes`);

            if (diasRestantes > 15) {
                validos++;
                console.log(`  ✅ Contado como Válido (total: ${validos})`);
            } else if (diasRestantes >= 0 && diasRestantes <= 15) {
                vencendoEmBreve++;
                console.log(`  ⚠️ Contado como Vencendo em Breve (total: ${vencendoEmBreve})`);
            } else {
                // Implicitly < 0 (Expired)
                vencidosPendentes++;
                console.log(`  🔴 Contado como Vencido/Pendente (total: ${vencidosPendentes})`);
            }
        }

        res.json({ validos, vencendoEmBreve, vencidosPendentes });

    } catch (error) {
        console.error('Erro ao calcular estatísticas de empresas:', error);
        res.status(500).json({ error: error.message });
    }
});

// Função helper para converter Timestamps do Firestore em Dates
function convertTimestamps(data) {
    return {
        ...data,
        dataSituacaoCadastral: data.dataSituacaoCadastral?.toDate?.() || data.dataSituacaoCadastral,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        // Converter também timestamps aninhados se existirem
        cartaoCNPJ: data.cartaoCNPJ ? {
            ...data.cartaoCNPJ,
            uploadedAt: data.cartaoCNPJ.uploadedAt?.toDate?.() || data.cartaoCNPJ.uploadedAt
        } : undefined
    };
}

// Listar Empresas do Usuário
app.get('/api/empresas', async (req, res) => {
    const { donoUid, donoEmail } = req.query;

    console.log('📋 [API/Empresas] Parâmetros recebidos:', { donoUid, donoEmail });

    if (!donoUid && !donoEmail) {
        return res.status(400).json({ error: 'donoUid ou donoEmail é obrigatório.' });
    }

    try {
        let empresas = [];

        // Buscar por donoUid se fornecido
        if (donoUid) {
            console.log('🔍 [API/Empresas] Buscando por donoUid:', donoUid);
            const snapshotUid = await db.collection('empresas')
                .where('donoUid', '==', donoUid)
                .get();

            snapshotUid.forEach(doc => {
                empresas.push({
                    id: doc.id,
                    ...convertTimestamps(doc.data())
                });
            });
            console.log('📦 [API/Empresas] Encontradas', empresas.length, 'empresas por UID');
        }

        // Se não encontrou por UID e tem email, tentar por email
        if (empresas.length === 0 && donoEmail) {
            console.log('🔍 [API/Empresas] Nenhuma empresa por UID, tentando por email:', donoEmail);

            // Primeiro, buscar o usuário pelo email para pegar o ID correto
            const userSnapshot = await db.collection('usuarios')
                .where('email', '==', donoEmail)
                .get();

            if (!userSnapshot.empty) {
                const userId = userSnapshot.docs[0].id;
                console.log('👤 [API/Empresas] Usuário encontrado por email, ID:', userId);

                const snapshotEmail = await db.collection('empresas')
                    .where('donoUid', '==', userId)
                    .get();

                snapshotEmail.forEach(doc => {
                    empresas.push({
                        id: doc.id,
                        ...convertTimestamps(doc.data())
                    });
                });
                console.log('📦 [API/Empresas] Encontradas', empresas.length, 'empresas por email');
            } else {
                console.warn('⚠️ [API/Empresas] Nenhum usuário encontrado com email:', donoEmail);
            }
        }

        res.json(empresas);
    } catch (error) {
        console.error('❌ [API/Empresas] Erro:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obter Detalhes de uma Empresa Específica
app.get('/api/empresas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const doc = await db.collection('empresas').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Empresa não encontrada.' });
        }
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cadastrar Nova Empresa (com upload de arquivo)
app.post('/api/empresas', upload.single('cartaoCNPJ'), async (req, res) => {
    const {
        razaoSocial,
        nomeFantasia,
        cnpj,
        donoUid,
        segmento,
        cidadeSede,
        cnaePrincipal,
        endereco,
        contato,
        situacaoCadastral,
        dataSituacaoCadastral,
        cnaesSecundarios
    } = req.body;

    // Validação de campos obrigatórios
    if (!razaoSocial || !cnpj || !donoUid) {
        return res.status(400).json({ error: 'Razão Social, CNPJ e donoUid são obrigatórios.' });
    }

    try {
        // Verificar se CNPJ já existe
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        const existingSnapshot = await db.collection('empresas')
            .where('cnpj', '==', cnpjLimpo)
            .get();

        if (!existingSnapshot.empty) {
            return res.status(400).json({ error: 'CNPJ já cadastrado no sistema.' });
        }

        // Preparar dados da empresa
        const newEmpresa = {
            razaoSocial,
            nomeFantasia: nomeFantasia || '',
            cnpj: cnpjLimpo,
            donoUid,
            segmento: segmento || '',
            cidadeSede: cidadeSede || '',
            cnaePrincipal: cnaePrincipal ? JSON.parse(cnaePrincipal) : { codigo: '', descricao: '' },
            endereco: endereco ? JSON.parse(endereco) : {},
            contato: contato ? JSON.parse(contato) : {},
            status: 'ativo', // Status padrão para novas empresas
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Upload do Cartão CNPJ se fornecido (agora no Google Drive)
        if (req.file) {
            const file = req.file;
            const driveData = await driveService.uploadFile(file.buffer, file.originalname, file.mimetype);

            // Adicionar informações do arquivo ao documento
            newEmpresa.cartaoCNPJ = {
                nome: file.originalname,
                url: driveData.webViewLink,
                fileId: driveData.fileId,
                tamanho: file.size,
                uploadedAt: admin.firestore.FieldValue.serverTimestamp()
            };
        }

        // Salvar no Firestore
        const docRef = await db.collection('empresas').add(newEmpresa);

        res.status(201).json({
            id: docRef.id,
            message: 'Empresa cadastrada com sucesso!',
            ...newEmpresa
        });
    } catch (error) {
        console.error('Erro ao cadastrar empresa:', error);
        res.status(500).json({ error: error.message });
    }
});

// Upload de Documento para uma Empresa (com estrutura hierárquica de pastas)
// Excluir Empresa (com exclusão em cascata)
app.delete('/api/empresas/:id', async (req, res) => {
    const { id } = req.params;

    console.log('🗑️ [BACKEND] Iniciando exclusão em cascata da empresa:', id);

    try {
        const empresaRef = db.collection('empresas').doc(id);
        const empresaDoc = await empresaRef.get();

        if (!empresaDoc.exists) {
            return res.status(404).json({ error: 'Empresa não encontrada.' });
        }

        const empresaData = empresaDoc.data();
        console.log('📋 [BACKEND] Empresa encontrada:', empresaData.razaoSocial || id);

        // 1. Buscar todos os documentos da empresa
        console.log('📄 [BACKEND] Buscando documentos da empresa...');
        const documentosSnapshot = await db.collection('documentos')
            .where('empresaId', '==', id)
            .get();

        console.log(`📄 [BACKEND] Encontrados ${documentosSnapshot.size} documento(s)`);

        // 2. Deletar cada documento e seu arquivo do Drive
        for (const docDoc of documentosSnapshot.docs) {
            const docData = docDoc.data();

            // 2.1. Deletar arquivo do Google Drive (se existir)
            if (docData.arquivo?.fileId) {
                try {
                    console.log(`☁️ [BACKEND] Deletando arquivo do Drive: ${docData.arquivo.fileId}`);
                    await driveService.deleteFile(docData.arquivo.fileId);
                    console.log('✅ [BACKEND] Arquivo deletado do Drive');
                } catch (driveError) {
                    console.warn('⚠️ [BACKEND] Erro ao deletar arquivo do Drive:', driveError.message);
                    // Continua mesmo se falhar (arquivo pode já ter sido deletado)
                }
            }

            // 2.2. Deletar documento do Firestore
            await docDoc.ref.delete();
            console.log(`✅ [BACKEND] Documento ${docDoc.id} deletado do Firestore`);
        }

        // 3. Deletar pasta da empresa no Google Drive (se existir)
        // A pasta da empresa é criada com o nome da razão social
        const nomeEmpresa = empresaData.razaoSocial || empresaData.nomeFantasia || `Empresa_${id}`;

        try {
            console.log(`📁 [BACKEND] Buscando pasta da empresa no Drive: ${nomeEmpresa}`);
            // Buscar a pasta pelo nome
            const folders = await driveService.listFolders(nomeEmpresa);

            if (folders && folders.length > 0) {
                for (const folder of folders) {
                    console.log(`🗑️ [BACKEND] Deletando pasta do Drive: ${folder.id}`);
                    await driveService.deleteFile(folder.id);
                    console.log('✅ [BACKEND] Pasta deletada do Drive');
                }
            } else {
                console.log('ℹ️ [BACKEND] Nenhuma pasta encontrada no Drive para esta empresa');
            }
        } catch (driveError) {
            console.warn('⚠️ [BACKEND] Erro ao deletar pasta do Drive:', driveError.message);
            // Continua mesmo se falhar
        }

        // 4. Deletar empresa do Firestore
        console.log('🗑️ [BACKEND] Deletando empresa do Firestore...');
        await empresaRef.delete();
        console.log('✅ [BACKEND] Empresa deletada do Firestore');

        console.log('✅ [BACKEND] Exclusão em cascata concluída com sucesso!');
        res.json({
            message: 'Empresa e todos os dados associados excluídos com sucesso!',
            deletedDocuments: documentosSnapshot.size
        });

    } catch (error) {
        console.error('❌ [BACKEND] Erro ao excluir empresa:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- ROTAS DE DOCUMENTOS ---

// Upload de Documento para uma Empresa
app.post('/api/empresas/:id/documentos', upload.single('arquivo'), async (req, res) => {
    const { id: empresaId } = req.params;

    console.log('🚀 [BACKEND] Iniciando upload para empresa ID:', empresaId);
    console.log('📋 [BACKEND] Dados recebidos:', {
        body: req.body,
        file: req.file ? { name: req.file.originalname, size: req.file.size } : 'Nenhum arquivo'
    });

    try {
        const { nome, identificacao, dataEmissao, dataVencimento, tipo, categoria } = req.body;
        const file = req.file;

        if (!nome || !tipo) {
            console.error('❌ [BACKEND] Erro: Campos obrigatórios faltando');
            return res.status(400).json({ error: 'Nome e tipo são obrigatórios.' });
        }

        // 1. Verificar se já existe um documento com o mesmo nome para esta empresa
        console.log('🔍 [BACKEND] Verificando se já existe documento com nome:', nome);
        const existingDocsSnapshot = await db.collection('documentos')
            .where('empresaId', '==', empresaId)
            .where('nome', '==', nome)
            .get();

        let documentoExistente = null;
        if (!existingDocsSnapshot.empty) {
            documentoExistente = {
                id: existingDocsSnapshot.docs[0].id,
                ...existingDocsSnapshot.docs[0].data()
            };
            console.log('⚠️ [BACKEND] Documento existente encontrado:', {
                id: documentoExistente.id,
                isPlaceholder: documentoExistente.placeholder
            });
        }

        // 2. Validar obrigatoriedade do arquivo
        if (!file && (!documentoExistente || documentoExistente.placeholder)) {
            console.error('❌ [BACKEND] Erro: Arquivo é obrigatório para novos documentos ou placeholders');
            return res.status(400).json({ error: 'O arquivo PDF é obrigatório.' });
        }

        let driveFile = null;
        let empresaFolderId = null;
        let categoriaFolderId = null;

        if (file) {
            // Se tem arquivo novo, deletar o antigo do Drive se existir
            if (documentoExistente && documentoExistente.arquivo?.fileId) {
                try {
                    console.log('🗑️ [BACKEND] Deletando arquivo antigo do Drive...');
                    await driveService.deleteFile(documentoExistente.arquivo.fileId);
                } catch (error) {
                    console.warn('⚠️ [BACKEND] Erro ao deletar arquivo antigo:', error.message);
                }
            }

            // Buscar dados da empresa para criar estrutura de pastas
            const empresaDoc = await db.collection('empresas').doc(empresaId).get();
            const nomeEmpresa = empresaDoc.exists
                ? (empresaDoc.data().razaoSocial || empresaDoc.data().nomeFantasia || `Empresa_${empresaId}`)
                : `Empresa_${empresaId}`;

            // Criar/buscar pasta da empresa no Google Drive
            empresaFolderId = await driveService.getOrCreateFolder(nomeEmpresa);
            console.log(`📁 [BACKEND] Pasta da empresa: ${empresaFolderId}`);

            // Criar/buscar subpasta da categoria dentro da pasta da empresa
            categoriaFolderId = await driveService.getOrCreateFolder(
                categoria || 'Sem Categoria',
                empresaFolderId
            );
            console.log(`📁 [BACKEND] Pasta da categoria: ${categoriaFolderId}`);

            // Upload para o Google Drive na pasta da categoria
            const nomeArquivoPadronizado = `${nome}.pdf`;
            console.log('☁️ [BACKEND] Iniciando upload para Google Drive:', nomeArquivoPadronizado);
            driveFile = await driveService.uploadFile(
                file.buffer,
                nomeArquivoPadronizado,
                file.mimetype,
                categoriaFolderId  // Upload para dentro da pasta da categoria
            );
            console.log('✅ [BACKEND] Arquivo enviado ao Drive. FileId:', driveFile.fileId);
        }

        // 3. Preparar dados para Firestore
        const docData = {
            empresaId,
            nome,
            identificacao: identificacao || '',
            tipo,
            categoria: categoria || documentoExistente?.categoria || '',
            dataEmissao: dataEmissao ? admin.firestore.Timestamp.fromDate(new Date(dataEmissao)) : (documentoExistente?.dataEmissao || null),
            dataVencimento: dataVencimento ? admin.firestore.Timestamp.fromDate(new Date(dataVencimento)) : (documentoExistente?.dataVencimento || null),
            placeholder: false, // <--- Marcar como não mais pendente
            customizado: req.body.customizado === 'true' || req.body.customizado === true || false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Adicionar info de arquivo se foi feito upload
        if (driveFile) {
            docData.arquivo = {
                fileId: driveFile.fileId,
                url: driveFile.webViewLink,
                nome: `${nome}.pdf`,
                nomeOriginal: file.originalname,
                tamanho: file.size,
                mimetype: file.mimetype,
                folderId: categoriaFolderId,        // ID da pasta categoria
                empresaFolderId: empresaFolderId    // ID da pasta empresa
            };
        }

        let docRef;
        if (documentoExistente) {
            console.log('🔄 [BACKEND] Atualizando documento existente ID:', documentoExistente.id);
            await db.collection('documentos').doc(documentoExistente.id).update(docData);
            docRef = { id: documentoExistente.id };
        } else {
            console.log('➕ [BACKEND] Criando novo documento...');
            docData.createdAt = admin.firestore.FieldValue.serverTimestamp();
            docRef = await db.collection('documentos').add(docData);
        }

        res.status(201).json({
            id: docRef.id,
            ...docData,
            message: documentoExistente ? 'Documento atualizado com sucesso.' : 'Documento criado com sucesso.'
        });

    } catch (error) {
        console.error('❌ [BACKEND] Erro no upload:', error);
        res.status(500).json({ error: error.message });
    }
});

// Listar Documentos de uma Empresa
app.get('/api/empresas/:id/documentos', async (req, res) => {
    const { id: empresaId } = req.params;
    try {
        const snapshot = await db.collection('documentos')
            .where('empresaId', '==', empresaId)
            .get();

        const documentos = [];
        const hoje = new Date();

        snapshot.forEach(doc => {
            const data = doc.data();
            let diasAVencer = null;

            if (data.dataVencimento) {
                const venc = data.dataVencimento.toDate();
                const diffTime = venc - hoje;
                diasAVencer = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            documentos.push({
                id: doc.id,
                ...data,
                diasAVencer
            });
        });

        res.json(documentos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Excluir Documento (Soft Delete - Limpar dados e voltar para Pendente)
app.delete('/api/documentos/:id', async (req, res) => {
    const { id } = req.params;

    console.log('🗑️ [BACKEND] Iniciando exclusão (soft delete) do documento:', id);

    try {
        // 1. Buscar documento no Firestore
        const docRef = db.collection('documentos').doc(id);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            console.error('❌ [BACKEND] Documento não encontrado:', id);
            return res.status(404).json({ error: 'Documento não encontrado.' });
        }

        const docData = docSnapshot.data();
        console.log('📄 [BACKEND] Documento encontrado:', {
            nome: docData.nome,
            fileId: docData.arquivo?.fileId
        });

        // 2. Deletar arquivo do Google Drive se existir
        if (docData.arquivo?.fileId) {
            try {
                console.log('☁️ [BACKEND] Deletando arquivo do Drive. FileId:', docData.arquivo.fileId);
                await driveService.deleteFile(docData.arquivo.fileId);
                console.log('✅ [BACKEND] Arquivo deletado do Drive com sucesso');
            } catch (error) {
                console.warn('⚠️ [BACKEND] Erro ao deletar arquivo do Drive:', error.message);
                // Continua mesmo se falhar (arquivo pode já ter sido deletado)
            }
        }

        // 3. Resetar documento para estado pendente (Soft Delete)
        const resetData = {
            arquivo: null,
            identificacao: '',
            dataEmissao: null,
            dataVencimento: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        console.log('🔄 [BACKEND] Resetando documento para estado pendente...');
        await docRef.update(resetData);

        console.log('✅ [BACKEND] Documento resetado com sucesso! Card voltará ao estado pendente.');

        res.json({
            message: 'Documento excluído com sucesso. Card resetado para pendente.',
            resetData
        });
    } catch (error) {
        console.error('❌ [BACKEND] Erro ao excluir documento:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rota para buscar documentos customizados (placeholders criados pelo usuário)
app.get('/api/empresas/:id/custom-docs', async (req, res) => {
    const { id: empresaId } = req.params;

    try {
        const snapshot = await db.collection('documentos')
            .where('empresaId', '==', empresaId)
            .where('customizado', '==', true)
            .where('placeholder', '==', true)
            .get();

        const customDocs = [];
        snapshot.forEach(doc => {
            customDocs.push({ id: doc.id, ...doc.data() });
        });

        res.json(customDocs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para criar novo documento customizado (placeholder)
app.post('/api/empresas/:id/custom-docs', async (req, res) => {
    const { id: empresaId } = req.params;
    const { nome, categoria } = req.body;

    if (!nome || !categoria) {
        return res.status(400).json({ error: 'Nome e categoria são obrigatórios' });
    }

    try {
        const docData = {
            empresaId,
            nome,
            categoria,
            tipo: 'certidao',
            placeholder: true,
            customizado: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('documentos').add(docData);

        res.json({
            id: docRef.id,
            ...docData,
            message: 'Documento customizado criado com sucesso'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const archiver = require('archiver');

// Download de todos os documentos em ZIP
app.get('/api/empresas/:id/documentos/download-all', async (req, res) => {
    const { id: empresaId } = req.params;
    try {
        const snapshot = await db.collection('documentos')
            .where('empresaId', '==', empresaId)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'Nenhum documento encontrado para esta empresa.' });
        }

        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        res.attachment(`documentos_empresa_${empresaId}.zip`);
        archive.on('error', (err) => { throw err; });
        archive.pipe(res);

        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (data.arquivo && data.arquivo.fileId) {
                try {
                    const stream = await driveService.getFileStream(data.arquivo.fileId);
                    archive.append(stream, { name: data.arquivo.nomeOriginal });
                } catch (streamError) {
                    console.error(`Erro ao obter stream do arquivo ${data.arquivo.fileId}:`, streamError);
                }
            }
        }

        await archive.finalize();
    } catch (error) {
        console.error('Erro ao gerar ZIP:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
});

// --- ROTA DASHBOARD ---

app.get('/api/dashboard/stats', async (req, res) => {
    const { donoUid } = req.query;
    if (!donoUid) return res.status(400).json({ error: 'donoUid é obrigatório.' });

    try {
        // 1. Total de Empresas
        const empresasSnapshot = await db.collection('empresas').where('donoUid', '==', donoUid).get();
        const totalEmpresas = empresasSnapshot.size;
        const empresaIds = empresasSnapshot.docs.map(doc => doc.id);

        // 2. Documentos e Certidões
        let certidoesVencendo = 0;
        let documentosValidos = 0;
        let alertas = [];

        if (empresaIds.length > 0) {
            // Criar um mapa de ID -> Nome da Empresa para lookup rápido
            const empresaLookup = {};
            empresasSnapshot.forEach(doc => {
                empresaLookup[doc.id] = doc.data().razaoSocial || doc.data().nomeFantasia || 'Empresa';
            });

            const docsSnapshot = await db.collection('documentos')
                .where('empresaId', 'in', empresaIds)
                .get();

            const hoje = new Date();
            const limite15Dias = new Date();
            limite15Dias.setDate(hoje.getDate() + 15);

            docsSnapshot.forEach(doc => {
                const data = doc.data();

                // Pular documentos sem data de vencimento
                if (!data.dataVencimento) return;

                const vencimento = data.dataVencimento.toDate ? data.dataVencimento.toDate() : new Date(data.dataVencimento);

                if (vencimento < hoje) {
                    // Já venceu (também conta como alerta crítico)
                    certidoesVencendo++;
                    alertas.push({
                        ...data,
                        id: doc.id,
                        status: 'vencido',
                        nomeEmpresa: empresaLookup[data.empresaId] || 'Empresa'
                    });
                } else if (vencimento <= limite15Dias) {
                    certidoesVencendo++;
                    alertas.push({
                        ...data,
                        id: doc.id,
                        status: 'warning',
                        nomeEmpresa: empresaLookup[data.empresaId] || 'Empresa'
                    });
                } else {
                    documentosValidos++;
                }
            });
        }

        res.json({
            totalEmpresas,
            certidoesVencendo,
            documentosValidos,
            solicitacoesPendentes: 0, // Implementar quando houver a coleção de solicitações
            alertas
        });

    } catch (error) {
        console.error('Erro no Dashboard Stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// Nova Rota: Notificações Granulares de Vencimento
app.get('/api/notificacoes', async (req, res) => {
    const { donoUid } = req.query;
    if (!donoUid) return res.status(400).json({ error: 'donoUid é obrigatório.' });

    try {
        // 1. Buscar empresas do usuário
        const empresasSnapshot = await db.collection('empresas').where('donoUid', '==', donoUid).get();
        if (empresasSnapshot.empty) return res.json([]);

        const empresaLookup = {};
        const empresaIds = [];
        empresasSnapshot.forEach(doc => {
            const data = doc.data();
            empresaIds.push(doc.id);
            empresaLookup[doc.id] = data.razaoSocial || data.nomeFantasia || 'Empresa';
        });

        // 2. Buscar documentos das empresas
        const docsSnapshot = await db.collection('documentos')
            .where('empresaId', 'in', empresaIds)
            .get();

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const notificacoes = [];

        docsSnapshot.forEach(doc => {
            const data = doc.data();
            if (!data.dataVencimento || data.placeholder) return;

            const vencimento = data.dataVencimento.toDate ? data.dataVencimento.toDate() : new Date(data.dataVencimento);
            vencimento.setHours(0, 0, 0, 0);

            const diffTime = vencimento.getTime() - hoje.getTime();
            const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const dataFormatada = vencimento.toLocaleDateString('pt-BR');
            const nomeEmpresa = empresaLookup[data.empresaId];

            let tipo = "";
            let titulo = "";
            let descricao = "";

            if (diasRestantes < 0) {
                tipo = "vencido";
                titulo = `Documento Vencido: ${data.nome}`;
                descricao = `Atenção: O documento ${data.nome} da empresa ${nomeEmpresa} venceu em ${dataFormatada}.`;
            } else if (diasRestantes <= 10 && diasRestantes >= 1) {
                tipo = "urgente";
                titulo = `Vence em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}: ${data.nome}`;
                descricao = `Urgente: O documento ${data.nome} da empresa ${nomeEmpresa} vence em ${diasRestantes} dias (em ${dataFormatada}).`;
            } else if (diasRestantes === 15) {
                tipo = "alerta";
                titulo = `Vence em 15 dias: ${data.nome}`;
                descricao = `O documento ${data.nome} da empresa ${nomeEmpresa} vence em 15 dias (em ${dataFormatada}).`;
            } else if (diasRestantes === 20) {
                tipo = "alerta";
                titulo = `Vence em 20 dias: ${data.nome}`;
                descricao = `O documento ${data.nome} da empresa ${nomeEmpresa} vence em 20 dias (em ${dataFormatada}).`;
            }

            if (tipo) {
                notificacoes.push({
                    id: doc.id,
                    tipo,
                    titulo,
                    empresa: nomeEmpresa,
                    descricao,
                    dataVencimento: vencimento,
                    dias: diasRestantes,
                    lida: false, // Por enquanto não temos persistência de "lida" por notificação gerada dinamicamente
                    data: new Date().toISOString()
                });
            }
        });

        // Ordenar: vencidos primeiro, depois os mais próximos do vencimento
        notificacoes.sort((a, b) => a.dias - b.dias);

        res.json(notificacoes);

    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        res.status(500).json({ error: error.message });
    }
});

// Nova Rota: Estatísticas Detalhadas por Empresa
app.get('/api/dashboard/stats/:empresaId', async (req, res) => {
    const { empresaId } = req.params;

    try {
        // Buscar todos os documentos da empresa
        const docsSnapshot = await db.collection('documentos')
            .where('empresaId', '==', empresaId)
            .get();

        if (docsSnapshot.empty) {
            return res.json({
                totalDocumentos: 0,
                vencidos: 0,
                atencao: 0,
                validos: 0,
                alertasCriticos: []
            });
        }

        const hoje = new Date();
        let vencidos = 0;
        let atencao = 0;
        let validos = 0;
        const alertasCriticos = [];

        docsSnapshot.forEach(doc => {
            const data = doc.data();

            // Pular documentos sem data de vencimento
            if (!data.dataVencimento) return;

            const vencimento = data.dataVencimento.toDate ? data.dataVencimento.toDate() : new Date(data.dataVencimento);
            const diffTime = vencimento - hoje;
            const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diasRestantes < 0) {
                // Documento vencido
                vencidos++;
                alertasCriticos.push({
                    id: doc.id,
                    nome: data.nome,
                    categoria: data.categoria,
                    dataVencimento: data.dataVencimento,
                    diasRestantes,
                    status: 'Vencido',
                    fileId: data.arquivo?.fileId,
                    url: data.arquivo?.url
                });
            } else if (diasRestantes <= 15) {
                // Documento vencendo em breve (atenção)
                atencao++;
                alertasCriticos.push({
                    id: doc.id,
                    nome: data.nome,
                    categoria: data.categoria,
                    dataVencimento: data.dataVencimento,
                    diasRestantes,
                    status: 'Atenção',
                    fileId: data.arquivo?.fileId,
                    url: data.arquivo?.url
                });
            } else {
                // Documento válido
                validos++;
            }
        });

        // Ordenar alertas por urgência (vencidos primeiro, depois por dias restantes)
        alertasCriticos.sort((a, b) => a.diasRestantes - b.diasRestantes);

        res.json({
            totalDocumentos: docsSnapshot.size,
            // Mapping internal variables to Frontend Interface
            vencidosPendentes: vencidos,
            vencendoEmBreve: atencao,
            validos: validos,
            alertasCriticos: alertasCriticos
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas da empresa:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- OUTRAS ROTAS ---
// Rotas legadas removidas: fornecedores, doclicitacao
// O sistema opera exclusivamente com: usuarios, empresas,
// --- ROTAS DE CATEGORIAS ---

// Criar nova categoria para uma empresa
app.post('/api/empresas/:id/categorias', async (req, res) => {
    const { id: empresaId } = req.params;
    const { nome } = req.body;

    console.log('📂 [BACKEND] Criando nova categoria:', { empresaId, nome });

    try {
        if (!nome || !nome.trim()) {
            return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
        }

        // Verificar se já existe categoria com esse nome para esta empresa
        const existingCat = await db.collection('categorias')
            .where('empresaId', '==', empresaId)
            .where('nome', '==', nome.trim())
            .get();

        if (!existingCat.empty) {
            console.warn('⚠️ [BACKEND] Categoria já existe:', nome);
            return res.status(400).json({ error: 'Já existe uma categoria com este nome.' });
        }

        const categoriaData = {
            empresaId,
            nome: nome.trim(),
            customizada: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const catRef = await db.collection('categorias').add(categoriaData);
        console.log('✅ [BACKEND] Categoria criada com ID:', catRef.id);

        res.status(201).json({
            id: catRef.id,
            ...categoriaData,
            message: 'Categoria criada com sucesso.'
        });
    } catch (error) {
        console.error('❌ [BACKEND] Erro ao criar categoria:', error);
        res.status(500).json({ error: error.message });
    }
});

// Listar categorias de uma empresa (padrões + customizadas)
app.get('/api/empresas/:id/categorias', async (req, res) => {
    const { id: empresaId } = req.params;

    console.log('📂 [BACKEND] Buscando categorias para empresa:', empresaId);

    try {
        // Categorias padrões (sempre disponíveis)
        const categoriasPadrao = [
            'Habilitação Jurídica',
            'Regularidade Fiscal/Trabalhista',
            'Qualificação Técnica',
            'Qualificação Econômico-Financeira',
            'Documentação Societária',
            'Outros Documentos'
        ];

        // Buscar categorias customizadas
        const snapshot = await db.collection('categorias')
            .where('empresaId', '==', empresaId)
            .get();

        const categoriasCustomizadas = [];
        snapshot.forEach(doc => {
            categoriasCustomizadas.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log('📂 [BACKEND] Categorias encontradas:', {
            padrao: categoriasPadrao.length,
            customizadas: categoriasCustomizadas.length
        });

        res.json({
            padrao: categoriasPadrao,
            customizadas: categoriasCustomizadas,
            todas: [...categoriasPadrao, ...categoriasCustomizadas.map(c => c.nome)]
        });
    } catch (error) {
        console.error('❌ [BACKEND] Erro ao listar categorias:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- INICIAR SERVIDOR ---

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`A porta ${PORT} já está em uso. Tente encerrar o processo que está usando essa porta ou mude a porta no arquivo .env.`);
    } else {
        console.error(e);
    }
});
