const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { Telegraf } = require('telegraf');

const db = admin.firestore();

// Inicializar Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Inicializar Telegraf (Telegram Bot)
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

class NotificationService {
    async checkAndSendAlerts() {
        console.log('🔄 [CRON] Iniciando verificação de documentos vencidos...');
        
        try {
            const hoje = new Date();
            hoje.setHours(23, 59, 59, 999); // Final do dia de hoje para pegar tudo que vence até hoje
            
            // Usando collectionGroup para buscar de forma super eficiente em todas as empresas
            // Filtro Firestore: dataVencimento <= hoje
            // Filtro Memória: notificado != true (para evitar erro de conflito de multiplas desigualdades)
            const snapshotRaw = await db.collectionGroup('documentos')
                .where('dataVencimento', '<=', admin.firestore.Timestamp.fromDate(hoje))
                .get();

            const snapshot = {
                docs: snapshotRaw.docs.filter(doc => doc.data().notificado !== true),
                get empty() { return this.docs.length === 0; },
                get size() { return this.docs.length; }
            };

            if (snapshot.empty) {
                console.log('✅ [CRON] Nenhum documento novo vencido para notificar.');
                return { success: true, count: 0 };
            }

            console.log(`⚠️ [CRON] Encontrados ${snapshot.size} documentos para processar.`);

            // Agrupar documentos por donoUid
            const userDocsMap = new Map(); // donoUid -> [documentos]
            const empresasCache = new Map(); // empresaId -> donoUid

            for (const doc of snapshot.docs) {
                const docData = doc.data();
                
                // Pular customizados/placeholders irrelevantes que não tem arquivo associado (regra de negócio opcional)
                if (docData.placeholder) continue;

                const empresaId = docData.empresaId;
                let donoUid = empresasCache.get(empresaId);

                if (!donoUid) {
                    const empresaDoc = await db.collection('empresas').doc(empresaId).get();
                    if (empresaDoc.exists) {
                        donoUid = empresaDoc.data().donoUid;
                        empresasCache.set(empresaId, donoUid);
                    }
                }

                if (donoUid) {
                    if (!userDocsMap.has(donoUid)) {
                        userDocsMap.set(donoUid, []);
                    }
                    userDocsMap.get(donoUid).push({
                        docId: doc.id,
                        docRef: doc.ref,
                        nome: docData.nome,
                        empresaId: empresaId
                    });
                }
            }

            // Agora envia para cada usuário
            for (const [uid, documentos] of userDocsMap.entries()) {
                await this._notifyUser(uid, documentos);
            }

            console.log(`✅ [CRON] Processamento finalizado. Notificações enviadas para ${userDocsMap.size} usuário(s).`);
            return { success: true, count: snapshot.size };

        } catch (error) {
            console.error('❌ [CRON] Erro no processamento de notificações:', error);
            // Re-throw para a rota Cron capturar
            throw error; 
        }
    }

    async _notifyUser(uid, documentos) {
        try {
            const userDoc = await db.collection('usuarios').doc(uid).get();
            if (!userDoc.exists) {
                console.log(`[NOTIFY] Usuário ${uid} não encontrado na base.`);
                return;
            }

            const userData = userDoc.data();
            let notificacaoEnviada = false;

            // Formatar os documentos para mensagem
            let listaDocs = documentos.map(d => `- ${d.nome}`).join('\n');
            let listaDocsHTML = documentos.map(d => `<li><strong>${d.nome}</strong></li>`).join('');

            // Tentar enviar Telegram primeiro (mais rápido/direto) se configurado
            if (userData.telegramChatId) {
                try {
                    const mensagemBase = `⚠️ *Alerta DocLicitante*\n\nVocê possui *${documentos.length}* documento(s) vencido(s) ou vencendo:\n\n${listaDocs}\n\nAcesse o sistema para regularizar.`;
                    await bot.telegram.sendMessage(userData.telegramChatId, mensagemBase, { parse_mode: 'Markdown' });
                    console.log(`✉️ [TELEGRAM] Enviado para usuário ${uid}`);
                    notificacaoEnviada = true;
                } catch (tError) {
                    console.error(`❌ [TELEGRAM] Falha ao enviar para ${uid} (${userData.telegramChatId}):`, tError.message);
                }
            }

            // Tentar enviar E-mail se o usuário habilitou e tem email
            if (userData.notificacoesEmail && userData.email) {
                try {
                    const mailOptions = {
                        from: `"Alerta DocLicitante" <${process.env.EMAIL_USER}>`,
                        to: userData.email,
                        subject: `🚨 Alerta: ${documentos.length} Documentos Vencidos`,
                        html: `
                            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                                <h2 style="color: #dc2626;">Alerta do Sistema DocLicitante</h2>
                                <p>Olá, ${userData.nome || 'Usuário'}.</p>
                                <p>Identificamos que <strong>${documentos.length}</strong> do(s) seu(s) documento(s) estão vencidos.</p>
                                <ul>
                                    ${listaDocsHTML}
                                </ul>
                                <p>Recomendamos que você acesse a plataforma para atualizar a documentação assim que possível.</p>
                                <br>
                                <hr>
                                <small>Este é um e-mail automático. Não responda.</small>
                            </div>
                        `
                    };

                    await transporter.sendMail(mailOptions);
                    console.log(`✉️ [E-MAIL] Enviado para ${userData.email} (UID: ${uid})`);
                    notificacaoEnviada = true;
                } catch (eError) {
                    console.error(`❌ [E-MAIL] Falha ao enviar para ${userData.email}:`, eError.message);
                }
            }

            // Marcar como notificado APENAS se alguma notificação foi enviada
            // Ou se tivermos decidido que não há meios de notificar (para não travar o loop)
            if (notificacaoEnviada || (!userData.telegramChatId && !userData.notificacoesEmail)) {
                console.log(`🔄 [NOTIFY] Registrando idempotência para os ${documentos.length} documentos de ${uid}.`);
                const batch = db.batch();
                documentos.forEach(d => {
                    batch.update(d.docRef, { notificado: true });
                });
                await batch.commit();
            }

        } catch (error) {
            console.error(`❌ [NOTIFY] Erro severo processando usuário ${uid}:`, error);
        }
    }
}

module.exports = new NotificationService();
