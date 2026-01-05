const { google } = require('googleapis');
const path = require('path');

// Garante o carregamento do .env independente de onde o processo foi iniciado
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('\n🔍 === DIAGNÓSTICO GOOGLE DRIVE API ===');
console.log('📂 Caminho do .env:', path.join(__dirname, '../.env'));

// Lê as variáveis de ambiente
const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();

// Logs de diagnóstico
console.log('\n📋 Variáveis de Ambiente:');
console.log('  GOOGLE_CLIENT_ID:', clientId ? `${clientId.substring(0, 20)}...` : '❌ VAZIO');
console.log('  GOOGLE_CLIENT_SECRET:', clientSecret ? `${clientSecret.substring(0, 10)}...` : '❌ VAZIO');
console.log('  GOOGLE_REFRESH_TOKEN:', refreshToken ? `${refreshToken.substring(0, 20)}...` : '❌ VAZIO');

// Validação das variáveis de ambiente
if (!clientId) {
    console.error('\n❌ ERRO: GOOGLE_CLIENT_ID não encontrado no .env');
    throw new Error('GOOGLE_CLIENT_ID é obrigatório');
}

if (!clientSecret) {
    console.error('\n❌ ERRO: GOOGLE_CLIENT_SECRET não encontrado no .env');
    throw new Error('GOOGLE_CLIENT_SECRET é obrigatório');
}

if (!refreshToken) {
    console.error('\n❌ ERRO: GOOGLE_REFRESH_TOKEN não encontrado no .env');
    console.error('Execute o script: node server/scripts/get-refresh-token.js');
    throw new Error('GOOGLE_REFRESH_TOKEN é obrigatório');
}

const redirectUri = 'http://localhost';
console.log('  REDIRECT_URI:', redirectUri);

// Inicialização do cliente OAuth2
console.log('\n🔧 Inicializando OAuth2 Client...');
const auth = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
);

// Configuração das credenciais com o refresh token
console.log('🔑 Configurando credenciais com refresh token...');
auth.setCredentials({
    refresh_token: refreshToken
});

// Criação da instância do Google Drive com autenticação explícita
console.log('📁 Criando instância do Google Drive...');
const drive = google.drive({
    version: 'v3',
    auth: auth // Passagem explícita da instância autenticada
});

console.log('✅ Google Drive API configurada com sucesso');
console.log('===========================================\n');

module.exports = drive;
