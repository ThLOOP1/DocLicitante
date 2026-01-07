import { NextRequest, NextResponse } from 'next/server';
import { db, FieldValue } from '@/lib/firebase-admin';
import { convertTimestamps } from '@/lib/firestore-helpers';
import { parseForm, getSingleFile } from '@/lib/form-parser';
import * as driveService from '@/lib/drive-service';

/**
 * GET /api/empresas
 * Listar empresas do usuário
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const donoUid = searchParams.get('donoUid');
        const donoEmail = searchParams.get('donoEmail');

        console.log('📋 [API/Empresas] Parâmetros recebidos:', { donoUid, donoEmail });

        if (!donoUid && !donoEmail) {
            return NextResponse.json(
                { error: 'donoUid ou donoEmail é obrigatório.' },
                { status: 400 }
            );
        }

        let empresas: any[] = [];

        // Buscar por donoUid se fornecido
        if (donoUid) {
            console.log('🔍 [API/Empresas] Buscando por donoUid:', donoUid);
            const snapshotUid = await db.collection('empresas').where('donoUid', '==', donoUid).get();

            snapshotUid.forEach((doc) => {
                empresas.push({
                    id: doc.id,
                    ...convertTimestamps(doc.data()),
                });
            });
            console.log('📦 [API/Empresas] Encontradas', empresas.length, 'empresas por UID');
        }

        // Se não encontrou por UID e tem email, tentar por email
        if (empresas.length === 0 && donoEmail) {
            console.log('🔍 [API/Empresas] Nenhuma empresa por UID, tentando por email:', donoEmail);

            // Primeiro, buscar o usuário pelo email para pegar o ID correto
            const userSnapshot = await db.collection('usuarios').where('email', '==', donoEmail).get();

            if (!userSnapshot.empty) {
                const userId = userSnapshot.docs[0].id;
                console.log('👤 [API/Empresas] Usuário encontrado por email, ID:', userId);

                const snapshotEmail = await db.collection('empresas').where('donoUid', '==', userId).get();

                snapshotEmail.forEach((doc) => {
                    empresas.push({
                        id: doc.id,
                        ...convertTimestamps(doc.data()),
                    });
                });
                console.log('📦 [API/Empresas] Encontradas', empresas.length, 'empresas por email');
            } else {
                console.warn('⚠️ [API/Empresas] Nenhum usuário encontrado com email:', donoEmail);
            }
        }

        return NextResponse.json(empresas);
    } catch (error: any) {
        console.error('❌ [API/Empresas] Erro:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao listar empresas' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/empresas
 * Cadastrar nova empresa (com upload de arquivo)
 */
export async function POST(request: NextRequest) {
    try {
        const { fields, files } = await parseForm(request);

        const razaoSocial = fields.razaoSocial as string;
        const nomeFantasia = fields.nomeFantasia as string;
        const cnpj = fields.cnpj as string;
        const donoUid = fields.donoUid as string;
        const segmento = fields.segmento as string;
        const cidadeSede = fields.cidadeSede as string;
        const cnaePrincipal = fields.cnaePrincipal as string;
        const endereco = fields.endereco as string;
        const contato = fields.contato as string;

        // Validação de campos obrigatórios
        if (!razaoSocial || !cnpj || !donoUid) {
            return NextResponse.json(
                { error: 'Razão Social, CNPJ e donoUid são obrigatórios.' },
                { status: 400 }
            );
        }

        // Verificar se CNPJ já existe
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        const existingSnapshot = await db.collection('empresas').where('cnpj', '==', cnpjLimpo).get();

        if (!existingSnapshot.empty) {
            return NextResponse.json(
                { error: 'CNPJ já cadastrado no sistema.' },
                { status: 400 }
            );
        }

        // Preparar dados da empresa
        const newEmpresa: any = {
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
            updatedAt: FieldValue.serverTimestamp(),
        };

        // Upload do Cartão CNPJ se fornecido
        const file = getSingleFile(files, 'cartaoCNPJ');
        if (file) {
            const driveData = await driveService.uploadFile(
                file.buffer,
                file.originalname,
                file.mimetype
            );

            newEmpresa.cartaoCNPJ = {
                nome: file.originalname,
                url: driveData.webViewLink,
                fileId: driveData.fileId,
                tamanho: file.size,
                uploadedAt: FieldValue.serverTimestamp(),
            };
        }

        // Salvar no Firestore
        const docRef = await db.collection('empresas').add(newEmpresa);

        return NextResponse.json(
            {
                id: docRef.id,
                message: 'Empresa cadastrada com sucesso!',
                ...newEmpresa,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Erro ao cadastrar empresa:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao cadastrar empresa' },
            { status: 500 }
        );
    }
}
