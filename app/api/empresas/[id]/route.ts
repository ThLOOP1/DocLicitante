import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import * as driveService from '@/lib/drive-service';

/**
 * GET /api/empresas/[id]
 * Obter detalhes de uma empresa específica
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const doc = await db.collection('empresas').doc(id).get();

        if (!doc.exists) {
            return NextResponse.json(
                { error: 'Empresa não encontrada.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: doc.id,
            ...doc.data(),
        });
    } catch (error: any) {
        console.error('Erro ao buscar empresa:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao buscar empresa' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/empresas/[id]
 * Excluir empresa (com exclusão em cascata)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        console.log('🗑️ [BACKEND] Iniciando exclusão em cascata da empresa:', id);

        const empresaRef = db.collection('empresas').doc(id);
        const empresaDoc = await empresaRef.get();

        if (!empresaDoc.exists) {
            return NextResponse.json(
                { error: 'Empresa não encontrada.' },
                { status: 404 }
            );
        }

        const empresaData = empresaDoc.data();
        console.log('📋 [BACKEND] Empresa encontrada:', empresaData?.razaoSocial || id);

        // 1. Buscar todos os documentos da empresa
        console.log('📄 [BACKEND] Buscando documentos da empresa...');
        const documentosSnapshot = await db
            .collection('documentos')
            .where('empresaId', '==', id)
            .get();

        console.log(`📄 [BACKEND] Encontrados ${documentosSnapshot.size} documento(s)`);

        // 2. Deletar cada documento e seu arquivo do Drive
        for (const docDoc of documentosSnapshot.docs) {
            const docData = docDoc.data();

            // 2.1. Deletar arquivo do Google Drive (se existir)
            if (docData.arquivo?.fileId) {
                try {
                    console.log(`☁️ [BACKEND] Deletando arquivo do Drive: ${docData.arquivo.fileId}`);
                    await driveService.deleteFile(docData.arquivo.fileId);
                    console.log('✅ [BACKEND] Arquivo deletado do Drive');
                } catch (driveError: any) {
                    console.warn('⚠️ [BACKEND] Erro ao deletar arquivo do Drive:', driveError.message);
                    // Continua mesmo se falhar (arquivo pode já ter sido deletado)
                }
            }

            // 2.2. Deletar documento do Firestore
            await docDoc.ref.delete();
            console.log(`✅ [BACKEND] Documento ${docDoc.id} deletado do Firestore`);
        }

        // 3. Deletar pasta da empresa no Google Drive (se existir)
        const nomeEmpresa =
            empresaData?.razaoSocial || empresaData?.nomeFantasia || `Empresa_${id}`;

        try {
            console.log(`📁 [BACKEND] Buscando pasta da empresa no Drive: ${nomeEmpresa}`);
            const folders = await driveService.listFolders(nomeEmpresa);

            if (folders && folders.length > 0) {
                for (const folder of folders) {
                    console.log(`🗑️ [BACKEND] Deletando pasta do Drive: ${folder.id}`);
                    await driveService.deleteFile(folder.id);
                    console.log('✅ [BACKEND] Pasta deletada do Drive');
                }
            } else {
                console.log('ℹ️ [BACKEND] Nenhuma pasta encontrada no Drive para esta empresa');
            }
        } catch (driveError: any) {
            console.warn('⚠️ [BACKEND] Erro ao deletar pasta do Drive:', driveError.message);
            // Continua mesmo se falhar
        }

        // 4. Deletar empresa do Firestore
        console.log('🗑️ [BACKEND] Deletando empresa do Firestore...');
        await empresaRef.delete();
        console.log('✅ [BACKEND] Empresa deletada do Firestore');

        console.log('✅ [BACKEND] Exclusão em cascata concluída com sucesso!');

        return NextResponse.json({
            message: 'Empresa e todos os dados associados excluídos com sucesso!',
            deletedDocuments: documentosSnapshot.size,
        });
    } catch (error: any) {
        console.error('❌ [BACKEND] Erro ao excluir empresa:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao excluir empresa' },
            { status: 500 }
        );
    }
}
