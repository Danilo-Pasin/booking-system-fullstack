# Booking System

Sistema fullstack de reservas de acomodações, inspirado em Airbnb/Booking.com. Desenvolvido com **Clean Architecture**, **SOLID**, **TypeScript** e integração completa entre frontend Next.js e backend Fastify.

---

## Funcionalidades

- Autenticação JWT com cookie HttpOnly + Authorization header (dual)
- Cadastro e gerenciamento de acomodações (casas, apartamentos, quartos compartilhados)
- Múltiplas imagens por acomodação com upload via Cloudinary
- Sistema de reservas com controle de disponibilidade por datas
- **Fluxo de aprovação**: hóspede solicita → host aprova/rejeita
- Cancelamento de reservas com soft delete (status `CANCELED`)
- Preview de preços com taxas (plataforma, serviço, desconto por longa estadia)
- Painel do host com métricas e solicitações pendentes
- Upload de foto de perfil via Cloudinary
- Validação inline em formulários
- Breadcrumbs, lightbox de imagens, toast notifications
- Responsivo (mobile-first)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, TypeScript |
| Backend | Node.js, Fastify 5, TypeScript |
| ORM | Prisma 6 |
| Banco | PostgreSQL (Neon) |
| Autenticação | JWT (`@fastify/jwt` + `@fastify/cookie`) |
| Upload | Cloudinary |
| Testes | Vitest (139 testes, 27 arquivos) |
| Deploy | Vercel (frontend) + Railway (backend) |

---

## Arquitetura

```txt
booking-system-fullstack/
├── booking-system/       ← Backend/API
└── booking-frontend/     ← Frontend Next.js
```

### Princípios

- **Clean Architecture**: domínio no centro, casos de uso na camada de aplicação, infraestrutura na periferia
- **Repository Pattern**: interfaces no domínio, implementações concretas na infra
- **Domain Errors**: erros de negócio separados de erros técnicos
- **Event-Driven**: `BookingCreatedEvent` dispara handlers de email e métricas
- **Serializable Transactions**: prevenção de race conditions em criação de reservas

---

## Pré-requisitos

- Node.js 20+
- PostgreSQL (recomendo [Neon](https://neon.tech) — free tier)
- Conta no [Cloudinary](https://cloudinary.com) (upload de imagens)

---

## Configuração

### 1. Clone e instale dependências

```bash
git clone <repo-url>
cd POO-Ts

# Instalar dependências de ambos os projetos
cd booking-system && npm install
cd ../booking-frontend && npm install
cd ..
```

### 2. Variáveis de ambiente

Copie o arquivo de exemplo e preencha:

```bash
cp .env.example booking-system/.env
```

**Variáveis necessárias:**

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL de conexão do PostgreSQL (Neon) |
| `DIRECT_URL` | URL direta (mesma da DATABASE_URL para Neon) |
| `JWT_SECRET` | Chave secreta para JWT (mín. 32 caracteres) |
| `CLOUDINARY_CLOUD_NAME` | Cloud name do Cloudinary |
| `CLOUDINARY_API_KEY` | API Key do Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret do Cloudinary |
| `CORS_ORIGIN` | URL do frontend (ex: `http://localhost:3000`) |

Para o frontend, crie `booking-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> **Cloudinary é opcional em desenvolvimento.** O upload de imagens exige as credenciais, mas o sistema funciona sem elas (seed usa Unsplash URLs).

### 3. Banco de dados

```bash
cd booking-system
npx prisma migrate dev    # Aplica migrations
npx prisma db seed        # Popula com dados de exemplo
```

O seed cria:
- **2 hosts**: Ana Silva (`host@booking.com`) e Carlos Santos (`host2@booking.com`)
- **2 hóspedes**: Maria Oliveira (`guest@booking.com`) e João Pereira (`guest2@booking.com`)
- **8 acomodações** com descrições e imagens
- Senha padrão para todos: `senha123`

### 4. Rodar

```bash
# Na raiz do projeto (roda ambos simultaneamente)
npm run dev

# Ou individualmente:
cd booking-system && npm run server    # http://localhost:3001
cd booking-frontend && npm run dev     # http://localhost:3000
```

### 5. Testes

```bash
cd booking-system
npm test                 # 139 testes, 27 arquivos
npm run test:watch       # Modo watch
```

---

## API (Resumo)

| Método | Rota | Autenticação | Descrição |
|--------|------|-------------|-----------|
| POST | `/auth/register` | - | Cadastro |
| POST | `/auth/login` | - | Login |
| PUT | `/auth/become-host` | JWT | Tornar-se host |
| GET | `/auth/me` | JWT | Perfil atual |
| PUT | `/auth/me` | JWT | Atualizar perfil |
| GET | `/accommodations` | - | Listar acomodações |
| GET | `/accommodations/:id` | - | Detalhe da acomodação |
| GET | `/accommodations/mine` | JWT + Host | Minhas acomodações |
| POST | `/accommodations` | JWT + Host | Criar acomodação |
| PUT | `/accommodations/:id` | JWT + Host | Atualizar acomodação |
| DELETE | `/accommodations/:id` | JWT + Host | Excluir acomodação |
| POST | `/bookings/preview` | - | Preview de preço |
| POST | `/bookings` | JWT | Criar reserva |
| GET | `/bookings` | JWT | Listar minhas reservas |
| GET | `/bookings/:id` | JWT | Detalhe da reserva |
| DELETE | `/bookings/:id` | JWT | Cancelar reserva |
| PATCH | `/bookings/:id/status` | JWT + Host | Aprovar/rejeitar reserva |
| GET | `/host/dashboard` | JWT + Host | Painel do host |
| POST | `/uploads/image` | JWT | Upload de imagem |
| POST | `/auth/logout` | JWT | Logout |

Documentação Swagger disponível em `http://localhost:3001/docs` (apenas em desenvolvimento).

---

## Fluxo de Reservas

```
Hóspede                    Host
   |                        |
   |-- POST /bookings ----->|
   |   (status: PENDING)    |
   |                        |
   |                        |-- PATCH /bookings/:id/status
   |                        |   { status: "APPROVED" | "REJECTED" }
   |                        |
   |<-- status atualizado --|
   |                        |
   |-- DELETE /bookings/:id-|  (guest cancela → CANCELED)
```

- **PENDING**: aguardando aprovação do host
- **APPROVED**: host confirmou a reserva
- **REJECTED**: host recusou a solicitação
- **CANCELED**: hóspede cancelou

Conflito de datas considera apenas bookings `PENDING` e `APPROVED`. Reservas `REJECTED` e `CANCELED` não bloqueiam o calendário.

---

## Deploy

### Frontend (Vercel)

```bash
cd booking-frontend
npx vercel --prod
```

Configure a variável `NEXT_PUBLIC_API_URL` com a URL do backend em produção.

### Backend (Railway)

O repositório inclui `Dockerfile` para deploy conteinerizado.

1. Conecte o repositório ao Railway
2. Configure as variáveis de ambiente listadas acima
3. O comando de start é `npm run server`

---

## Licença

com foco em construção de portfólio profissional.
