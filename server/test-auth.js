const { google } = require('googleapis');
const path = require('path');

// Carrega o .env
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('\n🧪 === TESTE DE AUTENTICAÇÃO GOOGLE DRIVE ===\n');

// Lê as variáveis
const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();

console.log('📋 Verificando variáveis de ambiente:');
console.log('  GOOGLE_CLIENT_ID:', clientId ? `✅ ${clientId.substring(0, 30)}...` : '❌ VAZIO');
console.log('  GOOGLE_CLIENT_SECRET:', clientSecret ? `✅ ${clientSecret.substring(0, 15)}...` : '❌ VAZIO');
console.log('  GOOGLE_REFRESH_TOKEN:', refreshToken ? `✅ ${refreshToken.substring(0, 30)}...` : '❌ VAZIO');

if (!clientId || !clientSecret || !refreshToken) {
    console.error('\n❌ ERRO: Uma ou mais variáveis estão vazias!');
    console.log('Verifique o arquivo .env em:', path.join(__dirname, '.env'));
    process.exit(1);
}

console.log('\n🔧 Criando cliente OAuth2...');
const auth = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost'
);

console.log('🔑 Configurando refresh token...');
auth.setCredentials({
    refresh_token: refreshToken
});

console.log('🌐 Tentando obter access token...\n');

auth.getAccessToken((err, token) => {
    if (err) {
        console.error('❌ FALHA NA AUTENTICAÇÃO!\n');
        console.error('Erro:', err.message);
        console.error('\nDetalhes completos:');
        console.error(JSON.stringify(err, null, 2));

        console.log('\n📝 Possíveis causas:');
        console.log('  1. Refresh token expirado ou revogado');
        console.log('  2. Client ID/Secret incorretos');
        console.log('  3. Redirect URI não configurado no Google Console');
        console.log('  4. Refresh token gerado com credenciais diferentes');

        console.log('\n💡 Solução:');
        console.log('  Execute: node scripts/get-refresh-token.js');
        console.log('  E atualize o GOOGLE_REFRESH_TOKEN no .env\n');

        process.exit(1);
    } else {
        console.log('✅ SUCESSO! Autenticação funcionando corretamente!\n');
        console.log('Access Token obtido:', token.substring(0, 40) + '...');
        console.log('\n🎉 O problema NÃO está nas credenciais OAuth2.');
        console.log('Se o upload ainda falhar, o problema pode estar em:');
        console.log('  - Permissões da API do Drive');
        console.log('  - ID da pasta do Drive incorreto');
        console.log('  - Problemas de rede\n');

        process.exit(0);
    }
});
