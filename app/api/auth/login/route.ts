import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';

/**
 * POST /api/auth/login
 * Login de usuário
 * Nota: No Firebase, o login geralmente é feito no frontend.
 * Esta rota valida e retorna dados do usuário.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email é obrigatório.' },
                { status: 400 }
            );
        }

        // Buscar usuário pelo email
        const userRecord = await auth.getUserByEmail(email);
        const userDoc = await db.collection('usuarios').doc(userRecord.uid).get();

        if (!userDoc.exists) {
            return NextResponse.json(
                { error: 'Usuário não encontrado no banco de dados.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            uid: userRecord.uid,
            ...userDoc.data(),
        });
    } catch (error: any) {
        console.error('Erro no login:', error);
        return NextResponse.json(
            { error: 'Credenciais inválidas ou usuário não encontrado.' },
            { status: 401 }
        );
    }
}
