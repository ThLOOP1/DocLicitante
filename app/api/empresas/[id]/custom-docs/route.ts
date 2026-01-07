import { NextRequest, NextResponse } from 'next/server';
import { db, FieldValue } from '@/lib/firebase-admin';

/**
 * GET /api/empresas/[id]/custom-docs
 * Buscar documentos customizados (placeholders criados pelo usuário)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: empresaId } = await params;

        const snapshot = await db
            .collection('documentos')
            .where('empresaId', '==', empresaId)
            .where('customizado', '==', true)
            .where('placeholder', '==', true)
            .get();

        const customDocs: any[] = [];
        snapshot.forEach((doc) => {
            customDocs.push({ id: doc.id, ...doc.data() });
        });

        return NextResponse.json(customDocs);
    } catch (error: any) {
        console.error('Erro ao listar documentos customizados:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao listar documentos customizados' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/empresas/[id]/custom-docs
 * Criar novo documento customizado (placeholder)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: empresaId } = await params;
        const body = await request.json();
        const { nome, categoria } = body;

        if (!nome || !categoria) {
            return NextResponse.json(
                { error: 'Nome e categoria são obrigatórios' },
                { status: 400 }
            );
        }

        const docData = {
            empresaId,
            nome,
            categoria,
            tipo: 'certidao',
            placeholder: true,
            customizado: true,
            createdAt: FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection('documentos').add(docData);

        return NextResponse.json({
            id: docRef.id,
            ...docData,
            message: 'Documento customizado criado com sucesso',
        });
    } catch (error: any) {
        console.error('Erro ao criar documento customizado:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao criar documento customizado' },
            { status: 500 }
        );
    }
}
