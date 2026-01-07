import { getGoogleDrive } from './google-drive-config';
import { Readable } from 'stream';

/**
 * Serviço de integração com Google Drive
 * Migrado de server/services/driveService.js para TypeScript
 */

/**
 * Busca ou cria uma pasta no Google Drive
 * @param folderName - Nome da pasta
 * @param parentId - ID da pasta pai (null para raiz)
 * @returns ID da pasta
 */
export async function getOrCreateFolder(
    folderName: string,
    parentId: string | null = null
): Promise<string> {
    try {
        const drive = getGoogleDrive();
        console.log(`📁 [Drive] Buscando/criando pasta: "${folderName}"${parentId ? ` (pai: ${parentId})` : ' (raiz)'}`);

        // 1. Buscar pasta existente
        const query = parentId
            ? `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
            : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

        const response = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
            pageSize: 1,
        });

        // 2. Se encontrou, retornar ID existente
        if (response.data.files && response.data.files.length > 0) {
            const folderId = response.data.files[0].id!;
            console.log(`✅ [Drive] Pasta "${folderName}" já existe (ID: ${folderId})`);
            return folderId;
        }

        // 3. Se não encontrou, criar nova pasta
        console.log(`🆕 [Drive] Criando nova pasta: "${folderName}"`);

        const fileMetadata: any = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : [],
        };

        const folder = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id, name',
        });

        const newFolderId = folder.data.id!;
        console.log(`✅ [Drive] Pasta "${folderName}" criada com sucesso (ID: ${newFolderId})`);

        return newFolderId;
    } catch (error: any) {
        console.error(`❌ [Drive] Erro ao buscar/criar pasta "${folderName}":`, error.message);
        throw error;
    }
}

/**
 * Faz upload de um buffer para o Google Drive
 * @param fileBuffer - O buffer do arquivo
 * @param fileName - Nome original do arquivo
 * @param mimeType - Tipo do arquivo (ex: application/pdf)
 * @param parentFolderId - (Opcional) ID da pasta pai no Drive
 */
export async function uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    parentFolderId: string | null = null
): Promise<{ fileId: string; webViewLink: string; name: string }> {
    try {
        const drive = getGoogleDrive();
        console.log(`📤 [Drive] Iniciando upload: "${fileName}"${parentFolderId ? ` (pasta: ${parentFolderId})` : ''}`);

        const stream = new Readable();
        stream.push(fileBuffer);
        stream.push(null);

        const fileMetadata: any = {
            name: `${Date.now()}_${fileName}`,
            parents: parentFolderId ? [parentFolderId] : [],
        };

        const media = {
            mimeType: mimeType,
            body: stream,
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, name',
        });

        const fileId = response.data.id!;
        console.log(`✅ [Drive] Arquivo enviado com sucesso (ID: ${fileId})`);

        // Definir permissão para "qualquer pessoa com o link" poder ler
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        console.log(`🔓 [Drive] Permissões configuradas para leitura pública`);

        return {
            fileId: fileId,
            webViewLink: response.data.webViewLink!,
            name: response.data.name!,
        };
    } catch (error: any) {
        console.error('❌ Erro no upload para o Google Drive:');
        console.error('Mensagem:', error.message);
        console.error('Código:', error.code);
        throw error;
    }
}

/**
 * Exclui um arquivo do Google Drive
 * @param fileId - ID do arquivo no Drive
 */
export async function deleteFile(fileId: string): Promise<boolean> {
    try {
        const drive = getGoogleDrive();
        await drive.files.delete({ fileId: fileId });
        return true;
    } catch (error: any) {
        // Tratar erro 404 se o arquivo já foi removido
        if (error.code === 404) {
            console.warn(`Arquivo ${fileId} não encontrado no Drive (provavelmente já excluído).`);
            return true;
        }
        console.error('❌ Erro ao excluir arquivo do Google Drive:');
        console.error('Mensagem:', error.message);
        console.error('Código:', error.code);
        throw error;
    }
}

/**
 * Obtém um stream de leitura de um arquivo no Drive (para o ZIP)
 * @param fileId - ID do arquivo
 */
export async function getFileStream(fileId: string): Promise<any> {
    try {
        const drive = getGoogleDrive();
        const response = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        return response.data;
    } catch (error: any) {
        console.error('❌ Erro ao obter stream do arquivo:');
        console.error('Mensagem:', error.message);
        console.error('Código:', error.code);
        throw error;
    }
}

/**
 * Lista pastas no Google Drive por nome
 * @param folderName - Nome da pasta para buscar
 * @returns Array de pastas encontradas
 */
export async function listFolders(folderName: string): Promise<any[]> {
    try {
        const drive = getGoogleDrive();
        console.log(`🔍 [Drive] Buscando pastas com nome: "${folderName}"`);

        const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

        const response = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        console.log(`✅ [Drive] Encontradas ${response.data.files?.length || 0} pasta(s)`);
        return response.data.files || [];
    } catch (error: any) {
        console.error(`❌ [Drive] Erro ao listar pastas:`, error.message);
        throw error;
    }
}
