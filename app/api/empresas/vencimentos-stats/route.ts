import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * GET /api/empresas/vencimentos-stats
 * Estatísticas de vencimento para a tela Minhas Empresas
 * IMPORTANTE: Esta rota deve vir ANTES de /api/empresas/[id] para evitar conflito
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const donoUid = searchParams.get('donoUid');

        if (!donoUid) {
            return NextResponse.json(
                { error: 'donoUid é obrigatório.' },
                { status: 400 }
            );
        }

        console.log('📊 [STATS] Iniciando cálculo para donoUid:', donoUid);

        // 1. Buscar empresas do usuário
        const empresasSnapshot = await db
            .collection('empresas')
            .where('donoUid', '==', donoUid)
            .get();

        if (empresasSnapshot.empty) {
            console.log('📊 [STATS] Nenhuma empresa encontrada.');
            return NextResponse.json({
                validos: 0,
                vencendoEmBreve: 0,
                vencidosPendentes: 0,
            });
        }

        const empresaIds = empresasSnapshot.docs.map((doc) => doc.id);
        console.log('📊 [STATS] Empresa IDs:', empresaIds);

        // 2. Buscar documentos das empresas
        const docsSnapshot = await db
            .collection('documentos')
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
                .filter((doc) => doc.data().empresaId === empId)
                .map((doc) => ({ id: doc.id, ...doc.data() }));

            console.log(
                `📊 [STATS] Processando empresa ${empId}, ${empDocs.length} documentos encontrados`
            );

            // Processar todos os documentos
            empDocs.forEach((doc: any) => {
                console.log(
                    `📄 [STATS] Documento: ${doc.nome}, placeholder: ${doc.placeholder}, tem data: ${!!doc.dataVencimento}`
                );

                if (doc.placeholder || !doc.dataVencimento) {
                    vencidosPendentes++;
                    console.log(`  ➡️ Contado como Pendente (total: ${vencidosPendentes})`);
                } else {
                    processData(doc);
                }
            });
        }

        console.log(
            `📊 [STATS] RESULTADO FINAL - Válidos: ${validos}, Vencendo: ${vencendoEmBreve}, Pendentes: ${vencidosPendentes}`
        );

        function processData(data: any) {
            if (!data.dataVencimento) {
                vencidosPendentes++;
                console.log(`  ➡️ ${data.nome}: Sem data, contado como Pendente`);
                return;
            }

            const vencimento = data.dataVencimento.toDate
                ? data.dataVencimento.toDate()
                : new Date(data.dataVencimento);
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

        return NextResponse.json({
            validos,
            vencendoEmBreve,
            vencidosPendentes,
        });
    } catch (error: any) {
        console.error('Erro ao calcular estatísticas de empresas:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao calcular estatísticas' },
            { status: 500 }
        );
    }
}
