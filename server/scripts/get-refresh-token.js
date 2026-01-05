// const { google } = require('googleapis');
// const readline = require('readline');
// require('dotenv').config();

// // Limpeza de espaços vazios nas variáveis de ambiente
// const client_id = process.env.GOOGLE_CLIENT_ID?.trim();
// const client_secret = process.env.GOOGLE_CLIENT_SECRET?.trim();

// const oauth2Client = new google.auth.OAuth2(
//     client_id,
//     client_secret,
//     'http://localhost' // Sem barra no final - deve corresponder ao configurado no Google Console
// );

// const SCOPES = [
//     'https://www.googleapis.com/auth/drive.file', // Arquivos criados pela aplicação
//     'https://www.googleapis.com/auth/drive' // Acesso completo (recomendado para evitar problemas)
// ];

// const authUrl = oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//     prompt: 'consent' // Garante que o refresh_token seja retornado
// });

// console.log('--- AUTORIZAÇÃO DO GOOGLE DRIVE ---');
// console.log('1. Abra o link abaixo no seu navegador:');
// console.log(authUrl);
// console.log('\n2. Logo após autorizar, você será redirecionado para uma página (que pode dar erro, não importa).');
// console.log('3. Copie o parâmetro "code" da URL da barra de endereços.');

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });

// rl.question('\n4. Cole o código aqui: ', (code) => {
//     rl.close();
//     oauth2Client.getToken(code, (err, token) => {
//         if (err) {
//             console.error('Erro ao recuperar o token:', err);
//             return;
//         }
//         console.log('\n--- SUCESSO! ---');
//         console.log('Adicione o seguinte ao seu arquivo .env:');
//         console.log(`GOOGLE_REFRESH_TOKEN=${token.refresh_token}`);
//         console.log('\nSalve o arquivo e reinicie o servidor.');
//     });
// });



const { google } = require('googleapis');
const readline = require('readline');
const path = require('path');
// Força o carregamento do .env subindo um nível (de scripts/ para server/)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const redirect_uri = 'http://localhost'; // Definido explicitamente para evitar erros

// Validação de segurança
if (!client_id || !client_secret) {
    console.error('❌ ERRO: GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET não encontrados no .env!');
    console.log('Verifique se o arquivo .env está em: ' + path.join(__dirname, '../.env'));
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uri
);

const SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive'
];

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
});

console.log('--- AUTORIZAÇÃO DO GOOGLE DRIVE ---');
console.log('1. Abra o link abaixo no seu navegador:');
console.log('\x1b[36m%s\x1b[0m', authUrl); // Exibe em ciano para facilitar
console.log('\n2. Autorize o acesso e você será redirecionado para o localhost.');
console.log('3. Copie o parâmetro "code" da URL (ex: ?code=4/0Af...)');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('\n4. Cole o código gerado aqui: ', (code) => {
    rl.close();
    // Limpa o código caso o usuário cole a URL inteira por engano
    const cleanCode = code.includes('code=') ? new URL(code, 'http://localhost').searchParams.get('code') : code;

    oauth2Client.getToken(cleanCode, (err, token) => {
        if (err) {
            console.error('❌ Erro ao recuperar o token:', err.response ? err.response.data : err.message);
            return;
        }
        console.log('\n--- SUCESSO! ---');
        console.log('Adicione/Atualize isso no seu arquivo .env:');
        console.log(`GOOGLE_REFRESH_TOKEN=${token.refresh_token}`);
        console.log('\nSalve o arquivo e reinicie o servidor com "node index.js"');
    });
});