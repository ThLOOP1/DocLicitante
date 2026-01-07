import { NextRequest, NextResponse } from 'next/server';
import { db, Timestamp, FieldValue } from '@/lib/firebase-admin';
import * as driveService from '@/lib/drive-service';

/**
 * GET /api/empresas/[id]/documentos
 * Listar documentos de uma empresa
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
            .get();

        const documentos: any[] = [];
        const hoje = new Date();

        snapshot.forEach((doc) => {
            const data = doc.data();
            let diasAVencer = null;

            if (data.dataVencimento) {
                const venc = data.dataVencimento.toDate();
                const diffTime = venc.getTime() - hoje.getTime();
                diasAVencer = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            documentos.push({
                id: doc.id,
                ...data,
                diasAVencer,
            });
        });

        return NextResponse.json(documentos);
    } catch (error: any) {
        console.error('Erro ao listar documentos:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao listar documentos' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/empresas/[id]/documentos
 * Upload de documento para uma empresa
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: empresaId } = await params;

        console.log('🚀 [BACKEND] Iniciando upload para empresa ID:', empresaId);

        // Parse form data
        const formData = await request.formData();

        // Log all form fields for debugging
        console.log('📋 [BACKEND] FormData entries:');
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`  - ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
            } else {
                console.log(`  - ${key}: ${value}`);
            }
        }

        const nome = formData.get('nome') as string;
        const identificacao = formData.get('identificacao') as string;
        const dataEmissao = formData.get('dataEmissao') as string;
        const dataVencimento = formData.get('dataVencimento') as string;
        const tipo = formData.get('tipo') as string;
        const categoria = formData.get('categoria') as string;
        const customizado = formData.get('customizado') as string;
        const file = formData.get('arquivo') as File | null;

        console.log('📋 [BACKEND] Dados processados:', {
            nome,
            tipo,
            categoria,
            file: file ? { name: file.name, size: file.size } : 'Nenhum arquivo',
        });

        if (!nome || !tipo) {
            console.error('❌ [BACKEND] Erro: Campos obrigatórios faltando');
            return NextResponse.json(
                { error: 'Nome e tipo são obrigatórios.' },
                { status: 400 }
            );
        }

        // 1. Verificar se já existe um documento com o mesmo nome para esta empresa
        console.log('🔍 [BACKEND] Verificando se já existe documento com nome:', nome);
        const existingDocsSnapshot = await db
            .collection('documentos')
            .where('empresaId', '==', empresaId)
            .where('nome', '==', nome)
            .get();

        let documentoExistente: any = null;
        if (!existingDocsSnapshot.empty) {
            documentoExistente = {
                id: existingDocsSnapshot.docs[0].id,
                ...existingDocsSnapshot.docs[0].data(),
            };
            console.log('⚠️ [BACKEND] Documento existente encontrado:', {
                id: documentoExistente.id,
                isPlaceholder: documentoExistente.placeholder,
            });
        }

        // 2. Validar obrigatoriedade do arquivo
        if (!file && (!documentoExistente || documentoExistente.placeholder)) {
            console.error('❌ [BACKEND] Erro: Arquivo é obrigatório para novos documentos ou placeholders');
            return NextResponse.json(
                { error: 'O arquivo PDF é obrigatório.' },
                { status: 400 }
            );
        }

        let driveFile: any = null;
        let empresaFolderId: string | null = null;
        let categoriaFolderId: string | null = null;

        if (file) {
            // Se tem arquivo novo, deletar o antigo do Drive se existir
            if (documentoExistente && documentoExistente.arquivo?.fileId) {
                try {
                    console.log('🗑️ [BACKEND] Deletando arquivo antigo do Drive...');
                    await driveService.deleteFile(documentoExistente.arquivo.fileId);
                } catch (error: any) {
                    console.warn('⚠️ [BACKEND] Erro ao deletar arquivo antigo:', error.message);
                }
            }

            // Buscar dados da empresa para criar estrutura de pastas
            const empresaDoc = await db.collection('empresas').doc(empresaId).get();
            const nomeEmpresa = empresaDoc.exists
                ? empresaDoc.data()?.razaoSocial ||
                empresaDoc.data()?.nomeFantasia ||
                `Empresa_${empresaId}`
                : `Empresa_${empresaId}`;

            // Criar/buscar pasta da empresa no Google Drive
            empresaFolderId = await driveService.getOrCreateFolder(nomeEmpresa);
            console.log(`📁 [BACKEND] Pasta da empresa: ${empresaFolderId}`);

            // Criar/buscar subpasta da categoria dentro da pasta da empresa
            categoriaFolderId = await driveService.getOrCreateFolder(
                categoria || 'Sem Categoria',
                empresaFolderId
            );
            console.log(`📁 [BACKEND] Pasta da categoria: ${categoriaFolderId}`);

            // Converter File para Buffer
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Upload para o Google Drive na pasta da categoria
            const nomeArquivoPadronizado = `${nome}.pdf`;
            console.log('☁️ [BACKEND] Iniciando upload para Google Drive:', nomeArquivoPadronizado);
            driveFile = await driveService.uploadFile(
                buffer,
                nomeArquivoPadronizado,
                file.type,
                categoriaFolderId
            );
            console.log('✅ [BACKEND] Arquivo enviado ao Drive. FileId:', driveFile.fileId);
        }

        // 3. Preparar dados para Firestore
        const docData: any = {
            empresaId,
            nome,
            identificacao: identificacao || '',
            tipo,
            categoria: categoria || documentoExistente?.categoria || '',
            dataEmissao: dataEmissao
                ? Timestamp.fromDate(new Date(dataEmissao))
                : documentoExistente?.dataEmissao || null,
            dataVencimento: dataVencimento
                ? Timestamp.fromDate(new Date(dataVencimento))
                : documentoExistente?.dataVencimento || null,
            placeholder: false,
            customizado: customizado === 'true' || false,
            updatedAt: FieldValue.serverTimestamp(),
        };

        // Adicionar info de arquivo se foi feito upload
        if (driveFile && file) {
            docData.arquivo = {
                fileId: driveFile.fileId,
                url: driveFile.webViewLink,
                nome: `${nome}.pdf`,
                nomeOriginal: file.name,
                tamanho: file.size,
                mimetype: file.type,
                folderId: categoriaFolderId,
                empresaFolderId: empresaFolderId,
            };
        }

        let docRef: any;
        if (documentoExistente) {
            console.log('🔄 [BACKEND] Atualizando documento existente ID:', documentoExistente.id);
            await db.collection('documentos').doc(documentoExistente.id).update(docData);
            docRef = { id: documentoExistente.id };
        } else {
            console.log('➕ [BACKEND] Criando novo documento...');
            docData.createdAt = FieldValue.serverTimestamp();
            docRef = await db.collection('documentos').add(docData);
        }

        console.log('✅ [BACKEND] Upload concluído com sucesso! ID:', docRef.id);

        return NextResponse.json(
            {
                id: docRef.id,
                message: 'Documento enviado com sucesso!',
                ...docData,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('❌ [BACKEND] Erro ao fazer upload:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao fazer upload do documento' },
            { status: 500 }
        );
    }
}
