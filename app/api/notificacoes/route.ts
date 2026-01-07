import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * GET /api/notificacoes
 * Notificações granulares de vencimento
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

        // 1. Buscar empresas do usuário
        const empresasSnapshot = await db.collection('empresas').where('donoUid', '==', donoUid).get();

        if (empresasSnapshot.empty) {
            return NextResponse.json([]);
        }

        const empresaLookup: any = {};
        const empresaIds: string[] = [];

        empresasSnapshot.forEach((doc) => {
            const data = doc.data();
            empresaIds.push(doc.id);
            empresaLookup[doc.id] = data.razaoSocial || data.nomeFantasia || 'Empresa';
        });

        // 2. Buscar documentos das empresas
        const docsSnapshot = await db
            .collection('documentos')
            .where('empresaId', 'in', empresaIds)
            .get();

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const notificacoes: any[] = [];

        docsSnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.dataVencimento || data.placeholder) return;

            const vencimento = data.dataVencimento.toDate
                ? data.dataVencimento.toDate()
                : new Date(data.dataVencimento);
            vencimento.setHours(0, 0, 0, 0);

            const diffTime = vencimento.getTime() - hoje.getTime();
            const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const dataFormatada = vencimento.toLocaleDateString('pt-BR');
            const nomeEmpresa = empresaLookup[data.empresaId];

            let tipo = '';
            let titulo = '';
            let descricao = '';

            if (diasRestantes < 0) {
                tipo = 'vencido';
                titulo = `Documento Vencido: ${data.nome}`;
                descricao = `Atenção: O documento ${data.nome} da empresa ${nomeEmpresa} venceu em ${dataFormatada}.`;
            } else if (diasRestantes <= 10 && diasRestantes >= 1) {
                tipo = 'urgente';
                titulo = `Vence em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}: ${data.nome}`;
                descricao = `Urgente: O documento ${data.nome} da empresa ${nomeEmpresa} vence em ${diasRestantes} dias (em ${dataFormatada}).`;
            } else if (diasRestantes === 15) {
                tipo = 'alerta';
                titulo = `Vence em 15 dias: ${data.nome}`;
                descricao = `O documento ${data.nome} da empresa ${nomeEmpresa} vence em 15 dias (em ${dataFormatada}).`;
            } else if (diasRestantes === 20) {
                tipo = 'alerta';
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
                    lida: false,
                    data: new Date().toISOString(),
                });
            }
        });

        // Ordenar: vencidos primeiro, depois os mais próximos do vencimento
        notificacoes.sort((a, b) => a.dias - b.dias);

        return NextResponse.json(notificacoes);
    } catch (error: any) {
        console.error('Erro ao buscar notificações:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao buscar notificações' },
            { status: 500 }
        );
    }
}
