import { NextRequest, NextResponse } from 'next/server';
import * as driveService from '@/lib/drive-service';

/**
 * DELETE /api/drive/delete/[fileId]
 * Deletar arquivo do Google Drive
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ fileId: string }> }
) {
    try {
        const { fileId } = await params;

        console.log('🗑️ [DRIVE] Deletando arquivo:', fileId);

        await driveService.deleteFile(fileId);

        console.log('✅ [DRIVE] Arquivo deletado com sucesso');

        return NextResponse.json({
            message: 'Arquivo deletado com sucesso',
            fileId,
        });
    } catch (error: any) {
        console.error('❌ [DRIVE] Erro ao deletar arquivo:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao deletar arquivo' },
            { status: 500 }
        );
    }
}
