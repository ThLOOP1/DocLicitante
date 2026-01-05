const drive = require('../config/googleDrive');
const { Readable } = require('stream');

/**
 * Busca ou cria uma pasta no Google Drive
 * @param {string} folderName - Nome da pasta
 * @param {string|null} parentId - ID da pasta pai (null para raiz)
 * @returns {Promise<string>} ID da pasta
 */
async function getOrCreateFolder(folderName, parentId = null) {
    try {
        console.log(`📁 [Drive] Buscando/criando pasta: "${folderName}"${parentId ? ` (pai: ${parentId})` : ' (raiz)'}`);

        // 1. Buscar pasta existente
        const query = parentId
            ? `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
            : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

        const response = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
            pageSize: 1
        });

        // 2. Se encontrou, retornar ID existente
        if (response.data.files && response.data.files.length > 0) {
            const folderId = response.data.files[0].id;
            console.log(`✅ [Drive] Pasta "${folderName}" já existe (ID: ${folderId})`);
            return folderId;
        }

        // 3. Se não encontrou, criar nova pasta
        console.log(`🆕 [Drive] Criando nova pasta: "${folderName}"`);

        const fileMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : []
        };

        const folder = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id, name'
        });

        const newFolderId = folder.data.id;
        console.log(`✅ [Drive] Pasta "${folderName}" criada com sucesso (ID: ${newFolderId})`);

        return newFolderId;

    } catch (error) {
        console.error(`❌ [Drive] Erro ao buscar/criar pasta "${folderName}":`, error.message);
        throw error;
    }
}

/**
 * Faz upload de um buffer para o Google Drive
 * @param {Buffer} fileBuffer - O buffer do arquivo
 * @param {string} fileName - Nome original do arquivo
 * @param {string} mimeType - Tipo do arquivo (ex: application/pdf)
 * @param {string} parentFolderId - (Opcional) ID da pasta pai no Drive
 */
async function uploadFile(fileBuffer, fileName, mimeType, parentFolderId = null) {
    try {
        console.log(`📤 [Drive] Iniciando upload: "${fileName}"${parentFolderId ? ` (pasta: ${parentFolderId})` : ''}`);

        const stream = new Readable();
        stream.push(fileBuffer);
        stream.push(null);

        const fileMetadata = {
            name: `${Date.now()}_${fileName}`,
            parents: parentFolderId ? [parentFolderId] : []
        };

        const media = {
            mimeType: mimeType,
            body: stream
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, name'
        });

        const fileId = response.data.id;
        console.log(`✅ [Drive] Arquivo enviado com sucesso (ID: ${fileId})`);

        // Definir permissão para "qualquer pessoa com o link" poder ler
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

        console.log(`🔓 [Drive] Permissões configuradas para leitura pública`);

        return {
            fileId: fileId,
            webViewLink: response.data.webViewLink,
            name: response.data.name
        };
    } catch (error) {
        console.error('❌ Erro no upload para o Google Drive:');
        console.error('Mensagem:', error.message);
        console.error('Código:', error.code);
        console.error('Detalhes completos:', JSON.stringify(error, null, 2));
        throw error;
    }
}

/**
 * Exclui um arquivo do Google Drive
 * @param {string} fileId - ID do arquivo no Drive
 */
async function deleteFile(fileId) {
    try {
        await drive.files.delete({ fileId: fileId });
        return true;
    } catch (error) {
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
 * @param {string} fileId 
 */
async function getFileStream(fileId) {
    try {
        const response = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        return response.data;
    } catch (error) {
        console.error('❌ Erro ao obter stream do arquivo:');
        console.error('Mensagem:', error.message);
        console.error('Código:', error.code);
        throw error;
    }
}

/**
 * Lista pastas no Google Drive por nome
 * @param {string} folderName - Nome da pasta para buscar
 * @returns {Promise<Array>} Array de pastas encontradas
 */
async function listFolders(folderName) {
    try {
        console.log(`🔍 [Drive] Buscando pastas com nome: "${folderName}"`);

        const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

        const response = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        console.log(`✅ [Drive] Encontradas ${response.data.files?.length || 0} pasta(s)`);
        return response.data.files || [];

    } catch (error) {
        console.error(`❌ [Drive] Erro ao listar pastas:`, error.message);
        throw error;
    }
}

module.exports = {
    getOrCreateFolder,
    uploadFile,
    deleteFile,
    getFileStream,
    listFolders
};
