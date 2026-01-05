# 🚀 Guia de Deploy - DocLicitante

## 📋 Pré-requisitos

- ✅ Conta na [Vercel](https://vercel.com)
- ✅ Repositório GitHub com o código
- ✅ Projeto Firebase configurado
- ✅ Backend Node.js deployado separadamente (Heroku, Railway, Render, etc.)

## 🔧 Configuração Local (Antes do Deploy)

### 1. Criar arquivo `.env.local`

Copie o arquivo `.env.example` e renomeie para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha com seus valores reais do Firebase Console.

### 2. Testar Build de Produção Localmente

```bash
npm run build
```

Se o build passar sem erros, você está pronto para o deploy!

## 🌐 Deploy na Vercel

### Passo 1: Importar Projeto

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New Project"**
3. Selecione seu repositório GitHub
4. Vercel detectará automaticamente que é Next.js

### Passo 2: Configurar Variáveis de Ambiente

Na tela de configuração do projeto, adicione as seguintes variáveis de ambiente:

#### Firebase (Obrigatórias)
```
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

#### Backend API (Obrigatória)
```
NEXT_PUBLIC_API_URL=https://seu-backend.herokuapp.com
```

> **Importante**: Substitua `https://seu-backend.herokuapp.com` pela URL real do seu backend deployado.

### Passo 3: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (2-5 minutos)
3. Vercel fornecerá uma URL: `https://seu-projeto.vercel.app`

## 🔥 Configuração do Firebase

### Adicionar Domínio Autorizado

Após o deploy, você DEVE adicionar o domínio da Vercel ao Firebase:

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Authentication** → **Settings** → **Authorized domains**
4. Clique em **"Add domain"**
5. Adicione: `seu-projeto.vercel.app`
6. Se tiver domínio customizado, adicione também

**Sem este passo, o login não funcionará em produção!**

## 🖥️ Deploy do Backend (Separado)

O backend Node.js (`server/index.js`) precisa ser deployado separadamente.

### Opções Recomendadas:

#### 1. Railway (Recomendado - Mais Fácil)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

#### 2. Render
1. Acesse [render.com](https://render.com)
2. Conecte seu repositório
3. Selecione a pasta `server/`
4. Configure variáveis de ambiente:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`

#### 3. Heroku
```bash
# Login
heroku login

# Criar app
heroku create seu-backend-app

# Deploy
git subtree push --prefix server heroku main
```

### Variáveis de Ambiente do Backend

Configure no seu serviço de hosting:

```
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_REFRESH_TOKEN=seu_refresh_token
PORT=3001
```

## ✅ Verificação Pós-Deploy

### Checklist Frontend (Vercel)

- [ ] Site abre sem erros
- [ ] Console do navegador não mostra erros de Firebase
- [ ] Página de login carrega
- [ ] Cadastro de usuário funciona
- [ ] Login funciona
- [ ] Dashboard carrega

### Checklist Backend

- [ ] Backend está online (acesse a URL diretamente)
- [ ] Endpoint `/api/empresas` responde
- [ ] Upload de documentos funciona
- [ ] Google Drive integration funciona

### Checklist Firebase

- [ ] Domínio Vercel está nos domínios autorizados
- [ ] Usuários conseguem fazer login
- [ ] Dados são salvos no Firestore

## 🐛 Troubleshooting

### Erro: "Firebase: Error (auth/unauthorized-domain)"
**Solução**: Adicione o domínio da Vercel aos domínios autorizados no Firebase Console.

### Erro: "Failed to fetch" nas chamadas de API
**Solução**: Verifique se `NEXT_PUBLIC_API_URL` está configurada corretamente e aponta para o backend deployado.

### Build falha na Vercel
**Solução**: 
1. Verifique os logs de build na Vercel
2. Teste `npm run build` localmente
3. Certifique-se de que todas as variáveis de ambiente estão configuradas

### Login funciona local mas não em produção
**Solução**: Verifique se o domínio da Vercel está nos domínios autorizados do Firebase.

## 📊 Monitoramento

### Vercel Analytics
A Vercel fornece analytics automático. Acesse em:
- Dashboard do projeto → Analytics

### Firebase Console
Monitore:
- **Authentication**: Número de usuários
- **Firestore**: Leituras/Escritas
- **Storage**: Uso de armazenamento

## 🔄 Atualizações Futuras

Toda vez que você fizer push para o branch `main` no GitHub:
1. Vercel detectará automaticamente
2. Fará build e deploy automático
3. Seu site será atualizado em ~2 minutos

## 📝 Notas Importantes

> **URLs Hardcoded**: Atualmente o frontend tem URLs `http://localhost:3001` hardcoded em vários lugares. Você precisará substituir por `process.env.NEXT_PUBLIC_API_URL` para que funcione em produção.

> **Backend Separado**: O backend Node.js NÃO é deployado na Vercel. Você precisa de um serviço separado (Railway, Render, Heroku, etc.).

> **Custos**: 
> - Vercel: Grátis para projetos pessoais
> - Firebase: Plano gratuito (Spark) tem limites
> - Backend: Depende do serviço escolhido (Railway/Render têm planos gratuitos)

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs de build na Vercel
2. Verifique o console do navegador (F12)
3. Verifique os logs do backend
4. Consulte a documentação:
   - [Vercel Docs](https://vercel.com/docs)
   - [Next.js Docs](https://nextjs.org/docs)
   - [Firebase Docs](https://firebase.google.com/docs)
