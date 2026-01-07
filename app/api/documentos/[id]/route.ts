import { NextRequest, NextResponse } from 'next/server';
import { db, FieldValue } from '@/lib/firebase-admin';
import * as driveService from '@/lib/drive-service';

/**
 * DELETE /api/documentos/[id]
 * Excluir documento (Soft Delete - Limpar dados e voltar para Pendente)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        console.log('🗑️ [BACKEND] Iniciando exclusão (soft delete) do documento:', id);

        // 1. Buscar documento no Firestore
        const docRef = db.collection('documentos').doc(id);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            console.error('❌ [BACKEND] Documento não encontrado:', id);
            return NextResponse.json(
                { error: 'Documento não encontrado.' },
                { status: 404 }
            );
        }

        const docData = docSnapshot.data();
        console.log('📄 [BACKEND] Documento encontrado:', {
            nome: docData?.nome,
            fileId: docData?.arquivo?.fileId,
        });

        // 2. Deletar arquivo do Google Drive se existir
        if (docData?.arquivo?.fileId) {
            try {
                console.log('☁️ [BACKEND] Deletando arquivo do Drive. FileId:', docData.arquivo.fileId);
                await driveService.deleteFile(docData.arquivo.fileId);
                console.log('✅ [BACKEND] Arquivo deletado do Drive com sucesso');
            } catch (error: any) {
                console.warn('⚠️ [BACKEND] Erro ao deletar arquivo do Drive:', error.message);
                // Continua mesmo se falhar (arquivo pode já ter sido deletado)
            }
        }

        // 3. Resetar documento para estado pendente (Soft Delete)
        const resetData = {
            arquivo: null,
            identificacao: '',
            dataEmissao: null,
            dataVencimento: null,
            updatedAt: FieldValue.serverTimestamp(),
        };

        console.log('🔄 [BACKEND] Resetando documento para estado pendente...');
        await docRef.update(resetData);

        console.log('✅ [BACKEND] Documento resetado com sucesso! Card voltará ao estado pendente.');

        return NextResponse.json({
            message: 'Documento excluído com sucesso. Card resetado para pendente.',
            resetData,
        });
    } catch (error: any) {
        console.error('❌ [BACKEND] Erro ao excluir documento:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao excluir documento' },
            { status: 500 }
        );
    }
}
