import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase-admin';

/**
 * POST /api/auth/register
 * Cadastro de novo usuário
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nome, email, cpf, telefone, senha, pais } = body;

        // Validação de campos obrigatórios
        if (!nome || !email || !cpf || !senha) {
            return NextResponse.json(
                { error: 'Campos obrigatórios: nome, email, cpf e senha.' },
                { status: 400 }
            );
        }

        // 1. Criar usuário no Firebase Authentication
        const userRecord = await auth.createUser({
            email,
            password: senha,
            displayName: nome,
            phoneNumber: telefone
                ? (telefone.startsWith('+') ? telefone : `+55${telefone.replace(/\D/g, '')}`)
                : undefined,
        });

        // 2. Salvar dados adicionais no Firestore
        await db.collection('usuarios').doc(userRecord.uid).set({
            nome,
            email,
            cpf: cpf.replace(/\D/g, ''), // Limpar caracteres do CPF
            telefone,
            pais: pais || 'Brasil',
            createdAt: new Date(),
            role: 'user', // Nível de acesso padrão
        });

        return NextResponse.json(
            {
                message: 'Usuário criado com sucesso!',
                uid: userRecord.uid,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Erro no cadastro:', error);

        // Tratamento específico para email duplicado
        if (error.code === 'auth/email-already-exists') {
            return NextResponse.json(
                {
                    error: 'EMAIL_DUPLICADO',
                    message: 'Email já cadastrado.',
                },
                { status: 409 }
            );
        }

        // Outros erros genéricos
        return NextResponse.json(
            { error: error.message || 'Erro ao criar usuário' },
            { status: 500 }
        );
    }
}
