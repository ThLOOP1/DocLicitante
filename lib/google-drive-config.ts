import { google } from 'googleapis';

/**
 * Configuração do Google Drive API para Next.js
 * Usa OAuth2 com refresh token
 */

let driveInstance: any = null;

export function getGoogleDrive() {
    if (driveInstance) {
        return driveInstance;
    }

    // Validar variáveis de ambiente
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error(
            'Variáveis de ambiente do Google Drive não configuradas. ' +
            'Configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REFRESH_TOKEN'
        );
    }

    const redirectUri = 'http://localhost';

    // Inicializar OAuth2 Client
    const auth = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
    );

    // Configurar credenciais com refresh token
    auth.setCredentials({
        refresh_token: refreshToken,
    });

    // Criar instância do Google Drive
    driveInstance = google.drive({
        version: 'v3',
        auth: auth,
    });

    console.log('✅ Google Drive API configurada com sucesso');
    return driveInstance;
}

export default getGoogleDrive;
