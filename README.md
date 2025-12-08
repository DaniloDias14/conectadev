# ConectaDev - Sistema de Desafios Técnicos

Plataforma de conexão entre desenvolvedores e contratantes através de um sistema de leilão reverso para projetos de software.

## 📋 Pré-requisitos

- Node.js (versão 18+)
- npm ou yarn
- Conta no Supabase com banco de dados PostgreSQL configurado
- Gmail para configuração de email (ou outro SMTP)

## 🚀 Como Executar o Sistema

### Passo 1: Clonar ou Preparar o Projeto

\`\`\`bash
cd conectadev
\`\`\`

### Passo 2: Configurar Banco de Dados

1. Acesse seu Supabase (https://supabase.com)
2. Crie um novo projeto ou use um existente
3. Acesse o SQL Editor
4. Copie todo o conteúdo do arquivo `database.sql`
5. Cole no SQL Editor do Supabase e execute
6. As tabelas serão criadas automaticamente

### Passo 3: Configurar Variáveis de Ambiente

Certifique-se de que o arquivo `.env` está na raiz do projeto com as seguintes variáveis (já fornecidas):

\`\`\`env
# Database PostgreSQL
DATABASE_URL=postgresql://postgres:Dd5834fg5576!@db.sktaiucsrdiitjhspiro.supabase.co:5432/postgres

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=sktdanilolucas@gmail.com
EMAIL_PASS=htxzduqpjozpsbbv

# JWT e Session
JWT_SECRET=DcFJjR5HYu4M7JPdrkRbLx+L9WRqE0WUKQsiXyDMT97hAitDImcs4Y++r63wsbFK5+gczmuGHl1WKylVXRQC4g==
SESSION_SECRET=Xo6G1cz3n6H8H0xXUQp0sFyqEJ4lBY2VJ6B2Hc3HzqNq1orT+8tVpz0BvuUnY2tAvUhEWeWfYvWJrS5nFq9Zbw==

# Supabase (Frontend)
VITE_SUPABASE_URL=https://sktaiucsrdiitjhspiro.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrdGFpdWNzcmRpaXRqaHNwaXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTUzNDUsImV4cCI6MjA4MDUzMTM0NX0.K6f5hJJbOOPRTpTNb3sW0L9KSeGklSZiKMcW3stOn6U
\`\`\`

### Passo 4: Instalar Dependências do Backend

\`\`\`bash
# Na raiz do projeto
npm install
\`\`\`

Copie as dependências do arquivo `package.txt` e adicione ao seu `package.json` na seção `"dependencies"`.

### Passo 5: Instalar Dependências do Frontend

\`\`\`bash
cd frontend
npm install
\`\`\`

### Passo 6: Executar o Backend

\`\`\`bash
# Na raiz do projeto
node backend/server.js
\`\`\`

O backend estará disponível em: `http://localhost:5000`

### Passo 7: Executar o Frontend

Em outro terminal:

\`\`\`bash
cd frontend
npm run dev
\`\`\`

O frontend estará disponível em: `http://localhost:5173`

## 📱 Acessando o Sistema

1. Abra o navegador e acesse: `http://localhost:5173`
2. Clique em "Cadastro" para criar uma conta
3. Escolha o tipo de usuário:
   - **Desenvolvedor (Proponente)**: Para enviar propostas em desafios
   - **Contratante**: Para criar e gerenciar desafios
4. Verifique seu email para ativar a conta
5. Faça login com suas credenciais

## 🔑 Usuários de Teste

Você pode criar novos usuários através da página de cadastro.

## 🛠️ Estrutura do Projeto

\`\`\`
conectadev/
├── backend/
│   ├── server.js
│   ├── config/
│   │   ├── supabaseClient.js
│   │   ├── email.js
│   │   └── jwt.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── desafioRoutes.js
│   │   ├── propostaRoutes.js
│   │   ├── comentarioRoutes.js
│   │   ├── perfilRoutes.js
│   │   ├── adminRoutes.js
│   │   └── assinaturaRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   └── utils/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── DetalhesDesafio.jsx
│   │   │   ├── CriarDesafio.jsx
│   │   │   ├── MinhasPropostas.jsx
│   │   │   ├── Perfil.jsx
│   │   │   ├── DashboardAdmin.jsx
│   │   │   ├── DashboardContratante.jsx
│   │   │   └── DashboardProponente.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── CardDesafio.jsx
│   │   │   └── Modal.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   └── styles/
│   │       └── global.css
│   ├── index.html
│   └── vite.config.js
│
├── database.sql
├── package.txt
├── .env
└── README.md
\`\`\`

## 🔐 Segurança

- Senhas são hashadas com bcryptjs (12 rounds)
- JWT tokens com expiração (15 minutos para access, 7 dias para refresh)
- Autenticação obrigatória em rotas protegidas
- Validação server-side em todos os endpoints
- CORS configurado para o frontend

## 📧 Emails Automáticos

O sistema envia emails para:
- Verificação de conta após cadastro
- Confirmação de login
- Recuperação de senha
- Notificações de novas propostas
- Notificações de comentários em desafios

## 🎯 Funcionalidades Implementadas

✅ Autenticação com JWT (access + refresh tokens)
✅ Cadastro e verificação de email
✅ Recuperação de senha
✅ Sistema de desafios (CRUD)
✅ Sistema de propostas (envio, edição, cancelamento)
✅ Sistema de comentários anônimos
✅ Dashboards por tipo de usuário
✅ Perfis públicos de usuários
✅ Métricas de administrador
✅ Email service com Nodemailer
✅ Banco de dados PostgreSQL (Supabase)
✅ Frontend responsivo com React + Vite

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verifique se a `DATABASE_URL` está correta no `.env`
- Confira se você pode acessar o Supabase com as credenciais

### Emails não estão sendo enviados
- Verifique as credenciais do Gmail no `.env`
- Confirme se a senha é de app (não a senha normal)
- Ative "Menos seguro" em sua conta Google se necessário

### Frontend não consegue conectar com backend
- Certifique-se de que o backend está rodando na porta 5000
- Verifique a configuração de CORS no `backend/server.js`
- Limpe o cache do navegador

## 📝 Notas Importantes

- O sistema foi desenvolvido em português brasileiro conforme solicitado
- Sem uso de TypeScript - apenas JavaScript puro
- Sem animações exageradas - design funcional e limpo
- Todas as dependências são essenciais para o funcionamento

## 📄 Licença

Este projeto é fornecido como está para fins educacionais.

---

**Desenvolvido com ❤️ para ConectaDev**
