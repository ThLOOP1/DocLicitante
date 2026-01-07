import { NextRequest, NextResponse } from 'next/server';
import { db, FieldValue } from '@/lib/firebase-admin';

/**
 * GET /api/empresas/[id]/categorias
 * Listar categorias (padrão + customizadas)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: empresaId } = await params;

        console.log('📂 [BACKEND] Buscando categorias para empresa:', empresaId);

        // Categorias padrões (sempre disponíveis)
        const categoriasPadrao = [
            'Habilitação Jurídica',
            'Regularidade Fiscal/Trabalhista',
            'Qualificação Técnica',
            'Qualificação Econômico-Financeira',
            'Documentação Societária',
            'Outros Documentos',
        ];

        // Buscar categorias customizadas
        const snapshot = await db
            .collection('categorias')
            .where('empresaId', '==', empresaId)
            .get();

        const categoriasCustomizadas: any[] = [];
        snapshot.forEach((doc) => {
            categoriasCustomizadas.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        console.log('📂 [BACKEND] Categorias encontradas:', {
            padrao: categoriasPadrao.length,
            customizadas: categoriasCustomizadas.length,
        });

        return NextResponse.json({
            padrao: categoriasPadrao,
            customizadas: categoriasCustomizadas,
            todas: [...categoriasPadrao, ...categoriasCustomizadas.map((c) => c.nome)],
        });
    } catch (error: any) {
        console.error('❌ [BACKEND] Erro ao listar categorias:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao listar categorias' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/empresas/[id]/categorias
 * Criar categoria customizada
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: empresaId } = await params;
        const body = await request.json();
        const { nome } = body;

        if (!nome) {
            return NextResponse.json(
                { error: 'Nome da categoria é obrigatório' },
                { status: 400 }
            );
        }

        const categoriaData = {
            empresaId,
            nome,
            createdAt: FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection('categorias').add(categoriaData);

        return NextResponse.json({
            id: docRef.id,
            ...categoriaData,
            message: 'Categoria criada com sucesso',
        });
    } catch (error: any) {
        console.error('Erro ao criar categoria:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao criar categoria' },
            { status: 500 }
        );
    }
}
