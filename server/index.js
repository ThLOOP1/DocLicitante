const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- CONFIGURAÇÃO DE CORS ---
const corsOptions = {
    origin: ['https://doc-licitante-x2fo.vercel.app', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// --- INICIALIZAÇÃO DO FIREBASE ADMIN ---
try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Corrige as quebras de linha da chave privada
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
            storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
        });
        console.log('✅ Firebase Admin inicializado via Env Vars.');
    }
} catch (error) {
    console.error('❌ Erro Crítico ao inicializar Firebase:', error.message);
}

const db = admin.firestore();
const auth = admin.auth();
const driveService = require('./services/driveService');
const notificationService = require('./services/notificationService');

const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Rota de teste
app.get('/', (req, res) => res.send('API DocLicitante Rodando no Render!'));

// --- ROTAS DE AUTENTICAÇÃO ---

app.post('/api/auth/register', async (req, res) => {
    const { nome, email, cpf, telefone, senha, pais } = req.body;

    if (!nome || !email || !cpf || !senha) {
        return res.status(400).json({ error: 'Campos obrigatórios: nome, email, cpf e senha.' });
    }

    try {
        const userRecord = await auth.createUser({
            email,
            password: senha,
            displayName: nome,
            phoneNumber: telefone ? (telefone.startsWith('+') ? telefone : `+55${telefone.replace(/\D/g, '')}`) : undefined
        });

        await db.collection('usuarios').doc(userRecord.uid).set({
            nome,
            email,
            cpf: cpf.replace(/\D/g, ''),
            telefone,
            pais: pais || 'Brasil',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            role: 'user'
        });

        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            uid: userRecord.uid
        });

    } catch (error) {
        console.error('Erro no cadastro:', error);
        if (error.code === 'auth/email-already-exists') {
            return res.status(409).json({
                error: 'EMAIL_DUPLICADO',
                message: 'Email já cadastrado.'
            });
        }
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
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

app.put('/api/users/:uid', async (req, res) => {
    const { uid } = req.params;
    const updateData = req.body;
    const allowedFields = ['nome', 'telefone', 'dataNascimento', 'endereco', 'role'];
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

app.get('/api/empresas/vencimentos-stats', async (req, res) => {
    const { donoUid } = req.query;
    if (!donoUid) return res.status(400).json({ error: 'donoUid é obrigatório.' });

    try {
        const empresasSnapshot = await db.collection('empresas').where('donoUid', '==', donoUid).get();
        if (empresasSnapshot.empty) {
            return res.json({ validos: 0, vencendoEmBreve: 0, vencidosPendentes: 0 });
        }

        const empresaIds = empresasSnapshot.docs.map(doc => doc.id);
        const docsSnapshot = await db.collection('documentos')
            .where('empresaId', 'in', empresaIds)
            .get();

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        let validos = 0;
        let vencendoEmBreve = 0;
        let vencidosPendentes = 0;

        for (const empId of empresaIds) {
            const empDocs = docsSnapshot.docs
                .filter(doc => doc.data().empresaId === empId)
                .map(doc => ({ id: doc.id, ...doc.data() }));

            empDocs.forEach(doc => {
                if (doc.placeholder || !doc.dataVencimento) {
                    vencidosPendentes++;
                } else {
                    processData(doc);
                }
            });
        }

        function processData(data) {
            if (!data.dataVencimento) {
                vencidosPendentes++;
                return;
            }
            const vencimento = data.dataVencimento.toDate ? data.dataVencimento.toDate() : new Date(data.dataVencimento);
            vencimento.setHours(0, 0, 0, 0);
            const diffTime = vencimento.getTime() - hoje.getTime();
            const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diasRestantes > 15) {
                validos++;
            } else if (diasRestantes >= 0 && diasRestantes <= 15) {
                vencendoEmBreve++;
            } else {
                vencidosPendentes++;
            }
        }

        res.json({ validos, vencendoEmBreve, vencidosPendentes });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function convertTimestamps(data) {
    return {
        ...data,
        dataSituacaoCadastral: data.dataSituacaoCadastral?.toDate?.() || data.dataSituacaoCadastral,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        cartaoCNPJ: data.cartaoCNPJ ? {
            ...data.cartaoCNPJ,
            uploadedAt: data.cartaoCNPJ.uploadedAt?.toDate?.() || data.cartaoCNPJ.uploadedAt
        } : undefined
    };
}

app.get('/api/empresas', async (req, res) => {
    const { donoUid, donoEmail } = req.query;
    if (!donoUid && !donoEmail) {
        return res.status(400).json({ error: 'donoUid ou donoEmail é obrigatório.' });
    }

    try {
        let empresas = [];
        if (donoUid) {
            const snapshotUid = await db.collection('empresas')
                .where('donoUid', '==', donoUid)
                .get();

            snapshotUid.forEach(doc => {
                empresas.push({
                    id: doc.id,
                    ...convertTimestamps(doc.data())
                });
            });
        }

        if (empresas.length === 0 && donoEmail) {
            const userSnapshot = await db.collection('usuarios')
                .where('email', '==', donoEmail)
                .get();

            if (!userSnapshot.empty) {
                const userId = userSnapshot.docs[0].id;
                const snapshotEmail = await db.collection('empresas')
                    .where('donoUid', '==', userId)
                    .get();

                snapshotEmail.forEach(doc => {
                    empresas.push({
                        id: doc.id,
                        ...convertTimestamps(doc.data())
                    });
                });
            }
        }

        res.json(empresas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

app.post('/api/empresas', upload.single('cartaoCNPJ'), async (req, res) => {
    const { razaoSocial, nomeFantasia, cnpj, donoUid, segmento, cidadeSede, cnaePrincipal, endereco, contato } = req.body;

    if (!razaoSocial || !cnpj || !donoUid) {
        return res.status(400).json({ error: 'Razão Social, CNPJ e donoUid são obrigatórios.' });
    }

    try {
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        const existingSnapshot = await db.collection('empresas').where('cnpj', '==', cnpjLimpo).get();

        if (!existingSnapshot.empty) {
            return res.status(400).json({ error: 'CNPJ já cadastrado no sistema.' });
        }

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
            status: 'ativo',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (req.file) {
            const file = req.file;
            const driveData = await driveService.uploadFile(file.buffer, file.originalname, file.mimetype);
            newEmpresa.cartaoCNPJ = {
                nome: file.originalname,
                url: driveData.webViewLink,
                fileId: driveData.fileId,
                tamanho: file.size,
                uploadedAt: admin.firestore.FieldValue.serverTimestamp()
            };
        }

        const docRef = await db.collection('empresas').add(newEmpresa);

        res.status(201).json({
            id: docRef.id,
            message: 'Empresa cadastrada com sucesso!',
            ...newEmpresa
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/empresas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const empresaRef = db.collection('empresas').doc(id);
        const empresaDoc = await empresaRef.get();

        if (!empresaDoc.exists) return res.status(404).json({ error: 'Empresa não encontrada.' });

        const empresaData = empresaDoc.data();
        const documentosSnapshot = await db.collection('documentos').where('empresaId', '==', id).get();

        for (const docDoc of documentosSnapshot.docs) {
            const docData = docDoc.data();
            if (docData.arquivo?.fileId) {
                try {
                    await driveService.deleteFile(docData.arquivo.fileId);
                } catch (e) { }
            }
            await docDoc.ref.delete();
        }

        const nomeEmpresa = empresaData.razaoSocial || empresaData.nomeFantasia || `Empresa_${id}`;
        try {
            const folders = await driveService.listFolders(nomeEmpresa);
            if (folders && folders.length > 0) {
                for (const folder of folders) {
                    await driveService.deleteFile(folder.id);
                }
            }
        } catch (e) { }

        await empresaRef.delete();
        res.json({ message: 'Empresa e todos os dados associados excluídos com sucesso!' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ROTAS DE DOCUMENTOS ---

app.post('/api/empresas/:id/documentos', upload.single('arquivo'), async (req, res) => {
    const { id: empresaId } = req.params;
    try {
        const { nome, identificacao, dataEmissao, dataVencimento, tipo, categoria } = req.body;
        const file = req.file;

        if (!nome || !tipo) return res.status(400).json({ error: 'Nome e tipo são obrigatórios.' });

        const existingDocsSnapshot = await db.collection('documentos')
            .where('empresaId', '==', empresaId)
            .where('nome', '==', nome)
            .get();

        let documentoExistente = null;
        if (!existingDocsSnapshot.empty) {
            documentoExistente = { id: existingDocsSnapshot.docs[0].id, ...existingDocsSnapshot.docs[0].data() };
        }

        if (!file && (!documentoExistente || documentoExistente.placeholder)) {
            return res.status(400).json({ error: 'O arquivo PDF é obrigatório.' });
        }

        let driveFile = null;
        let empresaFolderId = null;
        let categoriaFolderId = null;

        if (file) {
            if (documentoExistente && documentoExistente.arquivo?.fileId) {
                try { await driveService.deleteFile(documentoExistente.arquivo.fileId); } catch (e) { }
            }

            const empresaDoc = await db.collection('empresas').doc(empresaId).get();
            const nomeEmpresa = empresaDoc.exists ? (empresaDoc.data().razaoSocial || empresaDoc.data().nomeFantasia || `Empresa_${empresaId}`) : `Empresa_${empresaId}`;

            empresaFolderId = await driveService.getOrCreateFolder(nomeEmpresa);
            categoriaFolderId = await driveService.getOrCreateFolder(categoria || 'Sem Categoria', empresaFolderId);

            const nomeArquivoPadronizado = `${nome}.pdf`;
            driveFile = await driveService.uploadFile(file.buffer, nomeArquivoPadronizado, file.mimetype, categoriaFolderId);
        }

        const docData = {
            empresaId,
            nome,
            identificacao: identificacao || '',
            tipo,
            categoria: categoria || documentoExistente?.categoria || '',
            dataEmissao: dataEmissao ? admin.firestore.Timestamp.fromDate(new Date(dataEmissao)) : (documentoExistente?.dataEmissao || null),
            dataVencimento: dataVencimento ? admin.firestore.Timestamp.fromDate(new Date(dataVencimento)) : (documentoExistente?.dataVencimento || null),
            placeholder: false,
            customizado: req.body.customizado === 'true' || req.body.customizado === true || false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (driveFile) {
            docData.arquivo = {
                fileId: driveFile.fileId,
                url: driveFile.webViewLink,
                nome: `${nome}.pdf`,
                nomeOriginal: file.originalname,
                tamanho: file.size,
                mimetype: file.mimetype,
                folderId: categoriaFolderId,
                empresaFolderId: empresaFolderId
            };
        }

        let docRef;
        if (documentoExistente) {
            await db.collection('documentos').doc(documentoExistente.id).update(docData);
            docRef = { id: documentoExistente.id };
        } else {
            docData.createdAt = admin.firestore.FieldValue.serverTimestamp();
            docRef = await db.collection('documentos').add(docData);
        }

        res.status(201).json({ id: docRef.id, ...docData, message: 'Documento processado.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/empresas/:id/documentos', async (req, res) => {
    const { id: empresaId } = req.params;
    try {
        const snapshot = await db.collection('documentos').where('empresaId', '==', empresaId).get();
        const documentos = [];
        const hoje = new Date();

        snapshot.forEach(doc => {
            const data = doc.data();
            let diasAVencer = null;
            if (data.dataVencimento) {
                const venc = data.dataVencimento.toDate();
                diasAVencer = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
            }
            documentos.push({ id: doc.id, ...data, diasAVencer });
        });

        res.json(documentos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/documentos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const docRef = db.collection('documentos').doc(id);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) return res.status(404).json({ error: 'Documento não encontrado.' });

        const docData = docSnapshot.data();
        if (docData.arquivo?.fileId) {
            try { await driveService.deleteFile(docData.arquivo.fileId); } catch (e) { }
        }

        const resetData = { arquivo: null, identificacao: '', dataEmissao: null, dataVencimento: null, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
        await docRef.update(resetData);

        res.json({ message: 'Documento excluído. Card resetado.', resetData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/empresas/:id/custom-docs', async (req, res) => {
    const { id: empresaId } = req.params;
    try {
        const snapshot = await db.collection('documentos')
            .where('empresaId', '==', empresaId)
            .where('customizado', '==', true)
            .where('placeholder', '==', true)
            .get();

        const customDocs = [];
        snapshot.forEach(doc => customDocs.push({ id: doc.id, ...doc.data() }));
        res.json(customDocs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/empresas/:id/custom-docs', async (req, res) => {
    const { id: empresaId } = req.params;
    const { nome, categoria } = req.body;
    if (!nome || !categoria) return res.status(400).json({ error: 'Nome e categoria obrigatórios' });

    try {
        const docData = { empresaId, nome, categoria, tipo: 'certidao', placeholder: true, customizado: true, createdAt: admin.firestore.FieldValue.serverTimestamp() };
        const docRef = await db.collection('documentos').add(docData);
        res.json({ id: docRef.id, ...docData, message: 'Documento criado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const archiver = require('archiver');
app.get('/api/empresas/:id/documentos/download-all', async (req, res) => {
    const { id: empresaId } = req.params;
    try {
        const snapshot = await db.collection('documentos').where('empresaId', '==', empresaId).get();
        if (snapshot.empty) return res.status(404).json({ error: 'Nenhum documento encontrado.' });

        const archive = archiver('zip', { zlib: { level: 9 } });
        res.attachment(`documentos_empresa_${empresaId}.zip`);
        archive.on('error', (err) => { throw err; });
        archive.pipe(res);

        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (data.arquivo && data.arquivo.fileId) {
                try {
                    const stream = await driveService.getFileStream(data.arquivo.fileId);
                    archive.append(stream, { name: data.arquivo.nomeOriginal });
                } catch (e) { }
            }
        }
        await archive.finalize();
    } catch (error) {
        if (!res.headersSent) res.status(500).json({ error: error.message });
    }
});

// --- ROTA DASHBOARD ---

app.get('/api/dashboard/stats', async (req, res) => {
    const { donoUid } = req.query;
    if (!donoUid) return res.status(400).json({ error: 'donoUid é obrigatório.' });

    try {
        const empresasSnapshot = await db.collection('empresas').where('donoUid', '==', donoUid).get();
        const totalEmpresas = empresasSnapshot.size;
        const empresaIds = empresasSnapshot.docs.map(doc => doc.id);

        let certidoesVencendo = 0;
        let documentosValidos = 0;
        let alertas = [];

        if (empresaIds.length > 0) {
            const empresaLookup = {};
            empresasSnapshot.forEach(doc => { empresaLookup[doc.id] = doc.data().razaoSocial || doc.data().nomeFantasia || 'Empresa'; });

            const docsSnapshot = await db.collection('documentos').where('empresaId', 'in', empresaIds).get();
            const hoje = new Date();
            const limite15Dias = new Date();
            limite15Dias.setDate(hoje.getDate() + 15);

            docsSnapshot.forEach(doc => {
                const data = doc.data();
                if (!data.dataVencimento) return;

                const vencimento = data.dataVencimento.toDate ? data.dataVencimento.toDate() : new Date(data.dataVencimento);
                if (vencimento < hoje) {
                    certidoesVencendo++;
                    alertas.push({ ...data, id: doc.id, status: 'vencido', nomeEmpresa: empresaLookup[data.empresaId] || 'Empresa' });
                } else if (vencimento <= limite15Dias) {
                    certidoesVencendo++;
                    alertas.push({ ...data, id: doc.id, status: 'warning', nomeEmpresa: empresaLookup[data.empresaId] || 'Empresa' });
                } else {
                    documentosValidos++;
                }
            });
        }

        res.json({ totalEmpresas, certidoesVencendo, documentosValidos, solicitacoesPendentes: 0, alertas });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/notificacoes', async (req, res) => {
    const { donoUid } = req.query;
    if (!donoUid) return res.status(400).json({ error: 'donoUid é obrigatório.' });

    try {
        const empresasSnapshot = await db.collection('empresas').where('donoUid', '==', donoUid).get();
        if (empresasSnapshot.empty) return res.json([]);

        const empresaLookup = {};
        const empresaIds = [];
        empresasSnapshot.forEach(doc => {
            empresaIds.push(doc.id);
            empresaLookup[doc.id] = doc.data().razaoSocial || doc.data().nomeFantasia || 'Empresa';
        });

        const docsSnapshot = await db.collection('documentos').where('empresaId', 'in', empresaIds).get();
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

            let tipo = ""; let titulo = ""; let descricao = "";

            if (diasRestantes < 0) {
                tipo = "vencido"; titulo = `Documento Vencido: ${data.nome}`; descricao = `Atenção: O documento ${data.nome} da empresa ${nomeEmpresa} venceu em ${dataFormatada}.`;
            } else if (diasRestantes <= 10 && diasRestantes >= 1) {
                tipo = "urgente"; titulo = `Vence em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}: ${data.nome}`; descricao = `Urgente: O documento ${data.nome} da empresa ${nomeEmpresa} vence em ${diasRestantes} dias (em ${dataFormatada}).`;
            } else if (diasRestantes === 15 || diasRestantes === 20) {
                tipo = "alerta"; titulo = `Vence em ${diasRestantes} dias: ${data.nome}`; descricao = `O documento ${data.nome} da empresa ${nomeEmpresa} vence em ${diasRestantes} dias (em ${dataFormatada}).`;
            }

            if (tipo) {
                notificacoes.push({ id: doc.id, tipo, titulo, empresa: nomeEmpresa, descricao, dataVencimento: vencimento, dias: diasRestantes, lida: false, data: new Date().toISOString() });
            }
        });

        notificacoes.sort((a, b) => a.dias - b.dias);
        res.json(notificacoes);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/dashboard/stats/:empresaId', async (req, res) => {
    const { empresaId } = req.params;
    try {
        const docsSnapshot = await db.collection('documentos').where('empresaId', '==', empresaId).get();

        if (docsSnapshot.empty) {
            return res.json({ totalDocumentos: 0, vencidos: 0, atencao: 0, validos: 0, alertasCriticos: [] });
        }

        const hoje = new Date();
        let vencidos = 0; let atencao = 0; let validos = 0;
        const alertasCriticos = [];

        docsSnapshot.forEach(doc => {
            const data = doc.data();
            if (!data.dataVencimento) return;

            const vencimento = data.dataVencimento.toDate ? data.dataVencimento.toDate() : new Date(data.dataVencimento);
            const diasRestantes = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));

            if (diasRestantes < 0) {
                vencidos++;
                alertasCriticos.push({ id: doc.id, nome: data.nome, categoria: data.categoria, dataVencimento: data.dataVencimento, diasRestantes, status: 'Vencido', fileId: data.arquivo?.fileId, url: data.arquivo?.url });
            } else if (diasRestantes <= 15) {
                atencao++;
                alertasCriticos.push({ id: doc.id, nome: data.nome, categoria: data.categoria, dataVencimento: data.dataVencimento, diasRestantes, status: 'Atenção', fileId: data.arquivo?.fileId, url: data.arquivo?.url });
            } else {
                validos++;
            }
        });

        alertasCriticos.sort((a, b) => a.diasRestantes - b.diasRestantes);
        res.json({ totalDocumentos: docsSnapshot.size, vencidosPendentes: vencidos, vencendoEmBreve: atencao, validos: validos, alertasCriticos: alertasCriticos });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ROTAS DE CATEGORIAS ---

app.post('/api/empresas/:id/categorias', async (req, res) => {
    const { id: empresaId } = req.params;
    const { nome } = req.body;

    try {
        if (!nome || !nome.trim()) return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });

        const existingCat = await db.collection('categorias').where('empresaId', '==', empresaId).where('nome', '==', nome.trim()).get();
        if (!existingCat.empty) return res.status(400).json({ error: 'Já existe uma categoria com este nome.' });

        const categoriaData = { empresaId, nome: nome.trim(), customizada: true, createdAt: admin.firestore.FieldValue.serverTimestamp() };
        const catRef = await db.collection('categorias').add(categoriaData);

        res.status(201).json({ id: catRef.id, ...categoriaData, message: 'Categoria criada com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/empresas/:id/categorias', async (req, res) => {
    const { id: empresaId } = req.params;
    try {
        const categoriasPadrao = ['Habilitação Jurídica', 'Regularidade Fiscal/Trabalhista', 'Qualificação Técnica', 'Qualificação Econômico-Financeira', 'Documentação Societária', 'Outros Documentos'];
        const snapshot = await db.collection('categorias').where('empresaId', '==', empresaId).get();
        const categoriasCustomizadas = [];
        snapshot.forEach(doc => categoriasCustomizadas.push({ id: doc.id, ...doc.data() }));

        res.json({ padrao: categoriasPadrao, customizadas: categoriasCustomizadas, todas: [...categoriasPadrao, ...categoriasCustomizadas.map(c => c.nome)] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ROTAS DE NOTIFICAÇÃO E CRON ---

app.post('/api/telegram/webhook', async (req, res) => {
    res.send('OK');
});

app.get('/api/cron/check-vencimentos', async (req, res) => {
    const triggerKey = req.headers['x-cron-key'];
    if (!triggerKey || triggerKey !== process.env.CRON_SECRET_KEY) {
        console.warn('⚠️ [CRON] Acesso negado. Chave inválida.');
        return res.status(401).json({ error: 'Chave de cron inválida.' });
    }

    try {
        const resultado = await notificationService.checkAndSendAlerts();
        res.status(200).json({ message: 'Verificação de vencimentos concluída com sucesso.', ...resultado });
    } catch (error) {
        res.status(500).json({ error: 'Erro durante o processamento.', detalhe: error.message });
    }
});

// --- INICIAR SERVIDOR (PADRÃO RENDER) ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor DocLicitante rodando na porta ${PORT}`);
});