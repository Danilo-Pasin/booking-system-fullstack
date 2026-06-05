# Booking System — Resumo Técnico

Sistema fullstack de reservas de acomodações (tipo Airbnb), desenvolvido como projeto acadêmico de **POO + Clean Architecture**.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| **Linguagem** | TypeScript 6 |
| **Backend** | Fastify 5 + Prisma ORM |
| **Banco** | PostgreSQL (Neon) |
| **Frontend** | Next.js 16 + React 19 + Tailwind 4 + shadcn/ui |
| **Imagens** | Cloudinary |
| **Auth** | JWT (cookie HttpOnly + header Bearer) + bcrypt (cost 12) |
| **Testes** | Vitest — 139 testes, 27 arquivos |
| **Deploy** | Railway (backend) + Vercel (frontend) |

---

## Arquitetura (Clean Architecture)

```
booking-system/         → Backend (Fastify)
├── src/
│   ├── domain/         → Regras de negócio, entidades, interfaces de repositório, erros
│   ├── application/    → Casos de uso (22 use cases)
│   └── infra/          → Implementações concretas (HTTP, Prisma, Cloudinary)

booking-frontend/       → Frontend (Next.js)
├── app/                → Páginas (12 rotas)
├── components/         → Componentes reutilizáveis
├── contexts/           → AuthContext (React Context)
└── lib/                → API client, tipos, utilitários
```

**Regra de dependência:** sempre de fora para dentro. `infra` depende de `application` que depende de `domain`. Nenhuma camada interna conhece a externa.

---

## Domain (`src/domain/`)

### Entidades

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `User.ts` | Interface | `id, name, email, password, role (GUEST\|HOST), avatarUrl?, bio?, createdAt` |
| `Booking.ts` | **Class** | Máquina de estados: `PENDING → approve() → APPROVED`, `PENDING → reject() → REJECTED`, qualquer ativo → `cancel() → CANCELED`. Método `summarize()`. |
| `Accommodation.ts` | Interface | `id, name, type (house\|apartment\|shared_room), pricePerNight, description?, imageUrl?, images?, ownerId, calculatePrice(days)` |
| `House.ts` | **Class** | `calculatePrice()` = `pricePerNight * days + 80` (cleaning fee de \$80) |
| `Apartment.ts` | **Class** | `calculatePrice()` = `(pricePerNight * days) * 1.08` (condo fee de 8%) |
| `SharedRoom.ts` | **Class** | `calculatePrice()` = `pricePerNight * days` (sem taxa extra) |
| `Image.ts` | Type | `{ id, url, order }` |

### Interfaces de Repositório

| Interface | Métodos |
|-----------|---------|
| `UserRepository` | `save`, `update`, `findByEmail`, `findById` |
| `AccommodationRepository` | `findById`, `findAll(filters?)`, `findByOwnerId`, `save`, `update`, `delete` |
| `BookingRepository` | `save`, `tryCreate`, `findAll`, `findById`, `delete`, `hasConflict`, `findByUserId(statuses?)`, `findByAccommodationOwnerId`, `updateStatus` |

`BookingRepository` também exporta `BookingSummary` — dados planos da reserva + `userName`, `userEmail`, `accommodation`.

### Erros (hierarquia completa, mensagens em pt-BR)

```
DomainError
├── ValidationError
│   ├── PastCheckInError
│   ├── InvalidDateRangeError
│   └── BookingNotPendingError
├── NotFoundError
│   ├── AccommodationNotFoundError
│   └── BookingNotFoundError
├── ConflictError
│   ├── AccommodationUnavailableError
│   ├── EmailAlreadyInUseError
│   ├── AlreadyHostError
│   └── BookingAlreadyApprovedError
├── UnauthorizedError
│   └── InvalidCredentialsError
├── ForbiddenError
│   ├── HostOnlyError
│   └── NotOwnerError
└── UploadFailedError
```

### Outros arquivos de domínio

| Arquivo | Descrição |
|---------|-----------|
| `services/StorageProvider.ts` | Interface: `upload(file, fileName, mimeType): Promise<string>` |
| `events/DomainEvent.ts` | Interface: `{ eventName, occurredAt }` |
| `events/BookingCreatedEvent.ts` | Evento concreto: `eventName = "booking.created"` |
| `factories/AccommodationFactory.ts` | Cria `House`/`Apartment`/`SharedRoom` a partir de dados brutos |
| `fees/Fee.ts` | Interface + implementações: `PlatformFee(5.85%)`, `CleaningFee(\$80)`, `ServiceFee(3%)`, `DiscountCoupon`, `LongStayDiscount(-10% >7 dias)` |
| `utils/date.ts` | `calcDays(checkIn, checkOut)` — valida e calcula dias entre datas |

---

## Application (`src/application/`)

### 22 Casos de Uso

| Use Case | O que faz |
|----------|-----------|
| `RegisterUser` | Cadastro com bcrypt cost 12, retorna JWT |
| `LoginUser` | Login com email + senha, retorna JWT |
| `GetCurrentUser` | Perfil do usuário logado |
| `UpdateProfile` | Atualizar nome/avatar/bio + trocar senha (com validação da senha atual) |
| `GetPublicProfile` | Perfil público de outro usuário |
| `UpgradeToHost` | GUERT → HOST |
| `CreateAccommodation` | Criar acomodação (só HOST) |
| `UpdateAccommodation` | Editar acomodação |
| `DeleteAccommodation` | Excluir acomodação |
| `GetAccommodationById` | Detalhes de uma acomodação |
| `ListAccommodations` | Listar com filtros (search, type, sort) |
| `ListMyAccommodations` | Listar minhas acomodações |
| `CreateBooking` | Criar reserva (verifica conflito de datas, transação serializável) |
| `PreviewBookingPrice` | Preview de preço com taxas |
| `CancelBooking` | Cancelar reserva (só se PENDING) |
| `UpdateBookingStatus` | HOST aprova (APPROVED) ou rejeita (REJECTED) |
| `GetBookingById` | Detalhes de uma reserva |
| `ListUserBookings` | Reservas do guest (filtro opcional por status) |
| `ListHostBookings` | Reservas das acomodações do HOST |
| `GetHostDashboard` | Métricas do painel HOST (accommodationsCount, bookingsCount, estimatedRevenue) |
| `UploadImage` | Upload de imagem para Cloudinary |
| `UserResponse` | DTO helper `toUserResponse()` |

### Serviços

| Serviço | Descrição |
|---------|-----------|
| `PricingService` | Recebe array de `Fee[]`, calcula `{ base, fees[], total }` |
| `EventDispatcher` | `Map<string, EventHandler[]>`, registra e despacha eventos |
| `ReservationEmailHandler` | Handler: loga simulação de e-mail de confirmação |
| `ReservationMetricsHandler` | Handler: loga métricas (total bookings, receita) |

---

## Infra (`src/infra/`)

### Repositórios Prisma (produção)

| Arquivo | Descrição |
|---------|-----------|
| `PrismaUserRepository` | Implementa `UserRepository` |
| `PrismaAccommodationRepository` | Implementa `AccommodationRepository` com filtros (search, type, sort), imagens aninhadas |
| `PrismaBookingRepository` | Implementa `BookingRepository` — `tryCreate` com transação `SERIALIZABLE` e 3 retries, `hasConflict` considera PENDING + APPROVED |

### Repositórios InMemory (testes)

| Arquivo | Descrição |
|---------|-----------|
| `InMemoryUserRepository` | Array em memória |
| `InMemoryAccommodationRepository` | Array em memória |
| `InMemoryBookingRepository` | Array em memória |

### Storage

| Arquivo | Descrição |
|---------|-----------|
| `storage/CloudinaryStorage.ts` | Implementa `StorageProvider`, upload para Cloudinary na pasta `booking-system/` |

### HTTP — Rotas (Fastify, porta 3001)

| Rota | Método | Autenticação | Rate Limit | Descrição |
|------|--------|-------------|------------|-----------|
| `/auth/register` | POST | — | 10/min | Cadastro de usuário |
| `/auth/login` | POST | — | 10/min | Login |
| `/auth/me` | GET | JWT | — | Perfil do usuário logado |
| `/auth/me` | PUT | JWT | — | Atualizar perfil |
| `/auth/become-host` | PUT | JWT + HOST | 10/min | Upgrade para HOST |
| `/auth/logout` | POST | — | — | Limpa cookie JWT |
| `/users/:id` | GET | — | — | Perfil público |
| `/accommodations` | GET | — | — | Listar (filtros: search, type, sort) |
| `/accommodations` | POST | JWT + HOST | 20/min | Criar acomodação |
| `/accommodations/mine` | GET | JWT + HOST | — | Minhas acomodações |
| `/accommodations/:id` | GET | — | — | Detalhes |
| `/accommodations/:id` | PUT | JWT + HOST | — | Editar |
| `/accommodations/:id` | DELETE | JWT + HOST | — | Excluir (204) |
| `/bookings/preview` | POST | — | — | Preview de preço |
| `/bookings` | POST | JWT | 30/min | Criar reserva |
| `/bookings` | GET | JWT | — | Listar reservas (filtro ?status=) |
| `/bookings/:id` | GET | JWT | — | Detalhes da reserva |
| `/bookings/:id` | DELETE | JWT | — | Cancelar reserva |
| `/bookings/:id/status` | PATCH | JWT + HOST | — | Aprovar/rejeitar |
| `/host/dashboard` | GET | JWT + HOST | — | Dashboard do HOST |
| `/host/bookings` | GET | JWT + HOST | — | Reservas das acomodações |
| `/uploads/image` | POST | JWT | — | Upload para Cloudinary |

### HTTP — Middleware

| Função | Descrição |
|--------|-----------|
| `authenticate` | `request.jwtVerify()` — lanca `UnauthorizedError` se falhar |
| `requireHost(userRepo)` | Verifica `user.role === "HOST"` no banco — lanca `HostOnlyError` |

### Servidor (`server.ts`)

- Fastify na porta **3001**
- Plugins: CORS, Cookie, JWT, Rate Limit (1000/min global), Helmet, Multipart (5MB), Swagger (`/docs`)
- Injeção de dependências manual
- Error handler global: `DomainError` → HTTP status code apropriado
- Swagger disponível em `/docs` (apenas dev)

---

## Prisma Schema

```prisma
enum Role { GUEST, HOST }

model User {
  id             String          @id @default(uuid())
  name           String
  email          String          @unique
  password       String
  role           Role            @default(GUEST)
  avatarUrl      String?
  bio            String?
  createdAt      DateTime        @default(now())
  bookings       Booking[]
  accommodations Accommodation[]
}

model Accommodation {
  id             String    @id @default(uuid())
  name           String
  type           String
  pricePerNight  Float
  description    String?
  imageUrl       String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  ownerId        String
  owner          User      @relation(fields: [ownerId], references: [id])
  bookings       Booking[]
  images         Image[]
}

model Image {
  id              String        @id @default(uuid())
  url             String
  order           Int           @default(0)
  accommodationId String
  accommodation   Accommodation @relation(fields: [accommodationId], references: [id], onDelete: Cascade)
  createdAt       DateTime      @default(now())
}

enum BookingStatus { PENDING, APPROVED, REJECTED, CANCELED }

model Booking {
  id              String        @id @default(uuid())
  checkIn         DateTime
  checkOut        DateTime
  basePrice       Float
  totalPrice      Float
  status          BookingStatus @default(PENDING)
  createdAt       DateTime      @default(now())
  accommodationId String
  accommodation   Accommodation @relation(fields: [accommodationId], references: [id])
  userId          String
  user            User          @relation(fields: [userId], references: [id])
}
```

---

## Regras de Negócio Principais

### Booking Status Lifecycle

```
[Guest cria] → PENDING
                  |
         +--------+--------+
         |                  |
    [HOST APPROVA]    [HOST REJEITA]
         |                  |
     APPROVED           REJECTED
         |
    [Guest CANCELA]
         |
     CANCELED
```

- **Só PENDING** pode ser aprovada, rejeitada ou cancelada
- **Conflito de datas**: considera apenas reservas `PENDING` + `APPROVED` (ignora `REJECTED` e `CANCELED`)
- **`tryCreate`** usa transação `SERIALIZABLE` no Prisma com até 3 retries para evitar race conditions

### Senhas

- Mínimo 8 caracteres, deve conter letra + número
- Bcrypt cost 12
- `UpdateProfile` exige senha atual para trocar a senha

### Imagens

- Upload multipart (5MB max)
- Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`
- Detecção por magic bytes (não confia no `Content-Type`)
- Até 10 imagens por acomodação, ordenadas por `order`

---

## Frontend (`booking-frontend/`)

### 12 Páginas (Next.js App Router)

| Rota | Página |
|------|--------|
| `/` | Home (hero + destaques + benefícios) |
| `/accommodations` | Listagem com filtros (search, type, sort) |
| `/accommodations/[id]` | Detalhes + formulário de reserva |
| `/bookings` | Minhas reservas (ativas + histórico) |
| `/host` | Dashboard do HOST (métricas + reservas pendentes) |
| `/host/new` | Criar acomodação |
| `/host/[id]/edit` | Editar acomodação |
| `/login` | Login |
| `/register` | Cadastro |
| `/profile` | Meu perfil |
| `/profile/edit` | Editar perfil |
| `/users/[id]` | Perfil público |

### 14 Componentes Reutilizáveis

| Componente | Descrição |
|------------|-----------|
| `Navbar.tsx` | Navegação com estado de autenticação |
| `Footer.tsx` | Rodapé |
| `Breadcrumbs.tsx` | Navegação breadcrumb |
| `AccommodationCard.tsx` | Card de acomodação |
| `AccommodationFilters.tsx` | Filtros de busca/tipo/ordenação |
| `AvatarWithFallback.tsx` | Avatar com fallback |
| `BenefitsSection.tsx` | Seção de benefícios na home |
| `ConfirmModal.tsx` | Modal de confirmação |
| `EmptyState.tsx` | Estado vazio |
| `FeaturedAccommodations.tsx` | Destaques na home |
| `ImageLightbox.tsx` | Lightbox para imagens |
| `MetricCard.tsx` | Card de métrica (dashboard) |
| `ProtectedRoute.tsx` | Rota protegida |
| `FormCard.tsx` | Card para formulários |

### 13 Componentes UI (shadcn)

`avatar`, `button`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `select`, `separator`, `sheet`, `skeleton`, `Skeleton`, `textarea`

### Autenticação (AuthContext)

- **Token em `localStorage`** (chave `booking_token`)
- **Dual auth**: cookie HttpOnly + header `Authorization: Bearer`
- Interceptor 401 → limpa sessão + redireciona para `/login`
- Hook `useAuth()`: `{ user, token, isLoading, login, logout, updateUser }`

### API Client (`lib/api.ts`)

21 funções que chamam o backend com `credentials: "include"` + token no header:

| Função | Método | Rota |
|--------|--------|------|
| `fetchAccommodations(query?)` | GET | `/accommodations` |
| `fetchAccommodation(id)` | GET | `/accommodations/:id` |
| `previewPrice(...)` | POST | `/bookings/preview` |
| `createBooking(...)` | POST | `/bookings` |
| `fetchBookings(token)` | GET | `/bookings` |
| `register(...)` | POST | `/auth/register` |
| `login(...)` | POST | `/auth/login` |
| `cancelBooking(id, token)` | DELETE | `/bookings/:id` |
| `fetchMyAccommodations(token)` | GET | `/accommodations/mine` |
| `createAccommodation(data, token)` | POST | `/accommodations` |
| `updateAccommodation(id, data, token)` | PUT | `/accommodations/:id` |
| `deleteAccommodation(id, token)` | DELETE | `/accommodations/:id` |
| `fetchProfile(token?)` | GET | `/auth/me` |
| `updateProfile(data, token)` | PUT | `/auth/me` |
| `fetchPublicUser(id)` | GET | `/users/:id` |
| `becomeHost(token?)` | PUT | `/auth/become-host` |
| `uploadImage(file, token)` | POST | `/uploads/image` |
| `fetchHostDashboard(token)` | GET | `/host/dashboard` |
| `fetchHostBookings(token)` | GET | `/host/bookings` |
| `updateBookingStatus(...)` | PATCH | `/bookings/:id/status` |
| `logout()` | POST | `/auth/logout` |

---

## Testes

| Item | Valor |
|------|-------|
| **Framework** | Vitest |
| **Total de testes** | 139 |
| **Arquivos de teste** | 27 |
| **Cobertura** | 100% dos 22 use cases |
| **Repositórios** | InMemory (isolamento) |
| **Comando** | `npm test` no diretório `booking-system/` |

---

## Deploy

### Backend — Railway

```dockerfile
# Multi-stage build
# Stage 1 (builder): Node 20 Alpine, npm ci, prisma generate, tsc
# Stage 2 (runner): Node 20 Alpine, copia dist/ + prisma/ + node_modules
EXPOSE 3001
CMD: node dist/infra/http/server.js
```

### Frontend — Vercel

```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### Variáveis de Ambiente

**Backend (`.env` no `booking-system/`):**

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) com `sslmode=require` |
| `DIRECT_URL` | Conexão direta (Neon) |
| `JWT_SECRET` | Chave secreta JWT (mínimo 32 caracteres) |
| `CLOUDINARY_CLOUD_NAME` | Nome do cloud no Cloudinary |
| `CLOUDINARY_API_KEY` | Chave de API do Cloudinary |
| `CLOUDINARY_API_SECRET` | Segredo de API do Cloudinary |
| `CORS_ORIGIN` | Origem permitida (ex: `http://localhost:3000`) |
| `NODE_ENV` | `development` ou `production` |

**Frontend (`.env.local` no `booking-frontend/`):**

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL do backend (ex: `http://localhost:3001`) |

---

## Resumo Numérico

| Item | Quantidade |
|------|------------|
| Entidades de domínio | 5 (+ 1 interface + 1 type) |
| Casos de uso | 22 |
| Classes de erro | 18 |
| Rotas HTTP | 21 (+ Swagger) |
| Repositórios Prisma | 3 |
| Repositórios InMemory | 3 |
| Testes | 139 (27 arquivos) |
| Componentes frontend | 14 + 13 shadcn |
| Páginas frontend | 12 |
| Funções API client | 21 |
| Commits no git | 18+ |
| Dockerfile | 1 (multi-stage) |
| Branches | dev, main |

---

## Comandos Úteis

```bash
# Backend
cd booking-system
npm run dev          # Compilar + iniciar servidor
npm test             # Rodar testes (139 testes)
npx prisma studio    # Abrir Prisma Studio (interface do banco)
npx prisma db push   # Sincronizar schema com o banco
npx prisma db seed   # Popular banco com dados de exemplo

# Frontend
cd booking-frontend
npm run dev          # Iniciar Next.js em http://localhost:3000
npm run build        # Build de produção

# Root (monorepo)
npm run dev          # Inicia backend + frontend simultaneamente
```
