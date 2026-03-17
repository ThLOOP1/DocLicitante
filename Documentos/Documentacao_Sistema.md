# Documentação do Sistema DocLicitante

## 1. Visão Geral
O DocLicitante é uma plataforma web (SaaS) voltada para a gestão de empresas e seus respectivos documentos licitatórios. O foco principal do sistema é facilitar o controle de vencimentos dos certificados e certidões, além de armazenar de forma segura os arquivos PDFs em nuvem.

## 2. Arquitetura do Sistema
O projeto utiliza uma arquitetura "Client-Server" (Cliente e Servidor separados):
- **Frontend (Cliente):** Desenvolvido com o framework Next.js utilizando a estrutura App Router. Responsável por toda interface, navegação e interação com o usuário.
- **Backend (API Servidor):** Uma API REST desenvolvida em Node.js com Express. Responsável pelas integrações mais complexas com serviços do Google, processamento dos uploads de arquivo e manipulação privilegiada de banco de dados.
- **Banco de Dados & Autenticação:** Todo o banco de dados (NoSQL Document-oriented) e o controle de usuários é feito pelo **Firebase (Firestore e Authentication)**.
- **Armazenamento de Arquivos:** Os arquivos em si (físicos) são processados no backend e enviados para o **Google Drive** através da sua API oficial.

## 3. Tecnologias Utilizadas

### Frontend (Raiz do projeto)
- **Framework:** Next.js (com App Router) e React v19.
- **Estilização e UI:** 
  - Tailwind CSS v4 para roteirização rápida de classes de estilo.
  - Radix UI para compor funções acessíveis (Acordions, Dialogs, Selects, etc).
  - Framer Motion para animações suaves.
  - Lucide React para o pacote de Ícones.
- **Formulários e Validações:** React Hook Form integrado ao Zod.
- **Gráficos:** Recharts.
- **Integração Backend:** Firebase Client SDK v12 genérico para chamadas no navegador.

### Backend (Pasta `/server`)
- **Framework:** Node.js rodando Express.js.
- **Processamento de Arquivos:** Multer (processamento em Buffer/Memória) e Archiver.
- **Integrações de Nuvem:**
  - Firebase Admin SDK v13 (Acesso server-side com privilégios master para Firestore e Auth).
  - `googleapis` para gerenciar permissões, pastas e upload de documentos no Google Drive da plataforma.
- **Ferramentas:** CORS para permitir acesso ao frontend e Dotenv para gerenciar as variáveis de ambiente sigilosas.

## 4. Estrutura de Diretórios Principal
```
c:\Projeto X\DocLicitante-1
├── /app/               -> Funcionalidades e Rotas do Frontend (Dashboard, cadastro, login, perfil, empresas, solicitacoes)
├── /components/        -> Componentes genéricos de UI React
├── /hooks/             -> Custom React Hooks
├── /lib/               -> Utilitários e configurações compartilhadas (como conexao client do Firebase)
├── /Documentos/        -> Documentação em Markdown sobre o sistema
└── /server/            -> BACKEND (A API desenvolvida em Node)
    ├── /services/      -> Serviços como o `driveService.js` para integração Google Drive
    ├── /utils/         -> Funções utilitárias do Node (ex: manipuladores de data)
    ├── index.js        -> Ponto de montagem express com todas as rotas da API REST
    └── package.json    -> Dependências do Backend
```

## 5. Principais Módulos e Funcionalidades Identificados
1. **Autenticação:** Cadastro simplificado, Login e Recuperação de Senha atrelados ao Firebase Auth. O payload e níveis de permissões (`role: 'user'`) são guardados no Firestore.
2. **Dashboard:** Visão geral que puxa estatísticas, quantidade de empresas do usuário, avisos sobre documentos vencendo e gráficos de progressão.
3. **Gestão de Empresas:**
   - Cada usuário (donoUid) pode cadastrar e listar várias empresas pelo seu CNPJ.
   - Os dados cruciais (Nome fantasia, Razão Social, CNAEs) ficam guardados na Collection `empresas` no Firestore.
4. **Gestão de Documentos Licitatórios:**
   - Upload centralizado de PDFs e cartões de CNPJ.
   - **Lógica Inteligente de Pastas:** O Backend organiza os arquivos recebidos criando a árvore de pastas dinamicamente no Google Drive: `Nome da Empresa` > `Categoria`.
   - **Soft-Delete vs Hard-Delete:** É possível "limpar" um documento voltando ele para o estado de "pendente" além da possibilidade do soft-delete do cartão da empresa no cascate.
   - Cálculo automático via API se o documento está vencido, vencendo em breve ou válido.

## 6. Primeiros Passos: Como Executar o Projeto Localmente

### Passo 1: Iniciar o Backend
Abra um terminal, acesse a pasta `server` e inicie a API:
```bash
cd server
npm install
npm run dev
```
**Atenção aos Requisitos para o backend rodar perfeito:**
- Precisará existir um arquivo `.env` dentro da pasta `server/` contendo as credenciais de admin (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` e os tokens do `GOOGLE_CLIENT_ID`).
- Além disso, deve conter o arquivo nativo `serviceAccountKey.json` baixado do Firebase console na pasta `/server`.

### Passo 2: Iniciar o Frontend
Abra um segundo terminal, mantenha-se na pasta raiz `DocLicitante-1` e inicie o app:
```bash
npm install
npm run dev
```
**Atenção aos Requisitos para o frontend rodar perfeito:**
- O arquivo `.env.local` deve existir na raiz com as chaves públicas correspondentes ao Firebase: `NEXT_PUBLIC_FIREBASE_API_KEY`, e `NEXT_PUBLIC_API_URL` apontando para o Endereço local onde o servidor express do Passo 1 está operando (ex: `http://localhost:3000` ou `3001`).
