# Pergunte ao seu Contador

Plataforma web com assistente de IA para dúvidas de IR + agendamento de sessão paga com contador.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **PostgreSQL** via Docker
- **Prisma ORM** com migrações versionadas
- **JWT** em cookie httpOnly para autenticação
- **Zod** para validação de input

---

## Setup local (GitHub Codespace / Ubuntu)

### 1. Variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o `.env` se precisar trocar valores. Para desenvolvimento local, os padrões já funcionam.

### 2. Subir o banco de dados (Docker)

```bash
docker compose up -d
```

Isso sobe um PostgreSQL 16 na porta `5432`. Os dados ficam num volume nomeado `postgres_data` — sobrevive a restarts.

Para verificar que está rodando:

```bash
docker compose ps
```

### 3. Aplicar o schema no banco

Na primeira vez (cria as tabelas):

```bash
npx prisma migrate dev
```

Isso roda todas as migrações em `prisma/migrations/` em ordem.

Para regenerar o cliente Prisma sem migrar (ex: após pull):

```bash
npx prisma generate
```

### 4. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

Ao acessar `/`, você é redirecionado para `/login` caso não esteja autenticado.

---

## Variáveis de ambiente necessárias

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL | `postgresql://contador:contador_dev@localhost:5432/pergunteaosecontador` |
| `JWT_SECRET` | Segredo para assinar tokens JWT (mín. 32 chars em prod) | `troque-por-segredo-longo...` |

---

## Portando para Railway (deploy)

1. Crie um serviço **PostgreSQL** no Railway — copie a `DATABASE_URL` gerada
2. Crie um serviço **Web** apontando para este repositório
3. Nas variáveis de ambiente do serviço web, adicione:
   - `DATABASE_URL` — a string do Postgres do Railway
   - `JWT_SECRET` — uma string longa e aleatória (ex: `openssl rand -base64 48`)
4. No Railway, configure o **Start Command**: `npx prisma migrate deploy && npm start`
5. Faça o deploy — as migrações rodam automaticamente no boot

---

## Estrutura do projeto

```
src/
  app/
    api/auth/
      signup/   POST — cria conta, retorna cookie JWT
      login/    POST — autentica, retorna cookie JWT
      logout/   POST — limpa cookie
      me/       GET  — retorna usuário logado (ou 401)
    login/      Página de login/cadastro
    page.tsx    Home (protegida — redireciona se não logado)
  components/
    LogoutButton.tsx
  lib/
    prisma.ts   Singleton do Prisma Client
    auth.ts     JWT sign/verify + helpers de cookie
  middleware.ts Proteção de rotas via cookie JWT
prisma/
  schema.prisma Schema completo (User, Conversation, Message, Booking, Payment, UsageLog)
  migrations/   Migrações versionadas
docker-compose.yml  PostgreSQL local
.env.example        Variáveis necessárias (commitado)
```
