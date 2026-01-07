import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * GET /api/dashboard/stats
 * Estatísticas gerais do dashboard
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

        // 1. Total de Empresas
        const empresasSnapshot = await db.collection('empresas').where('donoUid', '==', donoUid).get();
        const totalEmpresas = empresasSnapshot.size;
        const empresaIds = empresasSnapshot.docs.map((doc) => doc.id);

        // 2. Documentos e Certidões
        let certidoesVencendo = 0;
        let documentosValidos = 0;
        const alertas: any[] = [];

        if (empresaIds.length > 0) {
            // Criar um mapa de ID -> Nome da Empresa para lookup rápido
            const empresaLookup: any = {};
            empresasSnapshot.forEach((doc) => {
                const data = doc.data();
                empresaLookup[doc.id] = data.razaoSocial || data.nomeFantasia || 'Empresa';
            });

            const docsSnapshot = await db
                .collection('documentos')
                .where('empresaId', 'in', empresaIds)
                .get();

            const hoje = new Date();
            const limite15Dias = new Date();
            limite15Dias.setDate(hoje.getDate() + 15);

            docsSnapshot.forEach((doc) => {
                const data = doc.data();

                // Pular documentos sem data de vencimento
                if (!data.dataVencimento) return;

                const vencimento = data.dataVencimento.toDate
                    ? data.dataVencimento.toDate()
                    : new Date(data.dataVencimento);

                if (vencimento < hoje) {
                    // Já venceu (também conta como alerta crítico)
                    certidoesVencendo++;
                    alertas.push({
                        ...data,
                        id: doc.id,
                        status: 'vencido',
                        nomeEmpresa: empresaLookup[data.empresaId] || 'Empresa',
                    });
                } else if (vencimento <= limite15Dias) {
                    certidoesVencendo++;
                    alertas.push({
                        ...data,
                        id: doc.id,
                        status: 'warning',
                        nomeEmpresa: empresaLookup[data.empresaId] || 'Empresa',
                    });
                } else {
                    documentosValidos++;
                }
            });
        }

        return NextResponse.json({
            totalEmpresas,
            certidoesVencendo,
            documentosValidos,
            solicitacoesPendentes: 0,
            alertas,
        });
    } catch (error: any) {
        console.error('Erro no Dashboard Stats:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao buscar estatísticas' },
            { status: 500 }
        );
    }
}
