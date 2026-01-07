import { NextRequest, NextResponse } from 'next/server';
import { db, FieldValue } from '@/lib/firebase-admin';

/**
 * GET /api/users/[uid]
 * Buscar perfil do usuário
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ uid: string }> }
) {
    try {
        const { uid } = await params;

        const userDoc = await db.collection('usuarios').doc(uid).get();

        if (!userDoc.exists) {
            return NextResponse.json(
                { error: 'Usuário não encontrado.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            uid: userDoc.id,
            ...userDoc.data(),
        });
    } catch (error: any) {
        console.error('Erro ao buscar usuário:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao buscar usuário' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/users/[uid]
 * Atualizar perfil do usuário
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ uid: string }> }
) {
    try {
        const { uid } = await params;
        const updateData = await request.json();

        // Campos permitidos para atualização
        const allowedFields = [
            'nome',
            'telefone',
            'dataNascimento',
            'endereco',
            'role',
        ];

        const filteredData: any = {};
        Object.keys(updateData).forEach((key) => {
            if (allowedFields.includes(key)) {
                filteredData[key] = updateData[key];
            }
        });

        await db.collection('usuarios').doc(uid).update({
            ...filteredData,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
            message: 'Perfil atualizado com sucesso!',
        });
    } catch (error: any) {
        console.error('Erro ao atualizar usuário:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao atualizar usuário' },
            { status: 500 }
        );
    }
}
