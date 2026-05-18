# Booking System API

Backend da aplicação Booking System, desenvolvido com TypeScript, Fastify, Prisma e PostgreSQL.

O projeto foi criado com foco em:

- Clean Architecture
- SOLID
- Programação Orientada a Objetos
- Repository Pattern
- APIs REST
- autenticação JWT
- arquitetura escalável

---

# Tecnologias

## Core
- TypeScript
- Node.js
- Fastify

## Banco de Dados
- PostgreSQL
- Prisma ORM
- Neon Database

## Segurança
- JWT Authentication
- bcrypt

---

# Arquitetura

O backend segue uma arquitetura inspirada em:

- Clean Architecture
- DDD (Domain Driven Design)
- SOLID Principles

Separando:
- regras de negócio
- casos de uso
- infraestrutura
- persistência
- camada HTTP

---

# Estrutura do Projeto

```txt
src/
├── domain/
│   ├── entities/
│   ├── fees/
│   └── repositories/
│
├── application/
│   ├── services/
│   └── use-cases/
│
└── infra/
    ├── repositories/
    └── http/
```

---

# Funcionalidades

- Cadastro de usuários
- Login JWT
- Listagem de acomodações
- Busca de acomodação por ID
- Preview de preços
- Criação de reservas
- Controle de conflito de datas
- Listagem de reservas
- Persistência em PostgreSQL

---

# API REST

Servidor local:

```txt
http://localhost:3001
```

---

# Rotas Públicas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/accommodations` | Lista acomodações |
| GET | `/accommodations/:id` | Busca acomodação |
| POST | `/bookings/preview` | Preview de preço |
| POST | `/auth/register` | Cadastro |
| POST | `/auth/login` | Login |

---

# Rotas Protegidas (JWT)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/bookings` | Criar reserva |
| GET | `/bookings` | Listar reservas |
| GET | `/bookings/:id` | Buscar reserva |
| DELETE | `/bookings/:id` | Cancelar reserva |

---

# Autenticação JWT

As rotas protegidas exigem:

```http
Authorization: Bearer TOKEN
```

---

# Execução Local

## Instalar dependências

```bash
npm install
```

---

## Configurar variáveis de ambiente

Criar arquivo:

```txt
.env
```

Exemplo:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="supersecret"
```

---

## Rodar migrations

```bash
npx prisma migrate dev
```

---

## Rodar servidor

```bash
npm run server
```

Servidor disponível em:

```txt
http://localhost:3001
```

---

# Prisma Studio

Visualizar banco:

```bash
npx prisma studio
```

---

# Banco de Dados

Estruturas atuais:

- User
- Accommodation
- Booking

Hospedado em:
- Neon PostgreSQL

---

# Conceitos Aplicados

| Conceito | Aplicação |
|---|---|
| Clean Architecture | separação domain/application/infra |
| SOLID | responsabilidades desacopladas |
| Repository Pattern | Prisma repositories |
| Use Cases | CreateBooking, LoginUser etc |
| Polimorfismo | tipos de acomodação |
| JWT | autenticação |
| ORM | Prisma |

---

# Regras de Negócio

## Acomodações

### House
- taxa fixa de limpeza

### Apartment
- taxa percentual de condomínio

### SharedRoom
- sem taxas extras

---

# Pricing Service

O cálculo final é desacoplado via:

```ts
Fee[]
```

Permitindo:
- taxas
- descontos
- cupons
- composição dinâmica

---

# Melhorias Futuras

## Segurança
- ownership validation
- refresh tokens

## Backend
- Swagger
- Zod validation
- DTOs
- middleware global
- logs estruturados

## Testes
- Vitest
- testes unitários
- testes E2E

---

# Objetivo do Projeto

Projeto desenvolvido para estudo avançado de:

- backend architecture
- autenticação
- banco de dados relacional
- APIs REST
- engenharia de software
- sistemas escaláveis

com foco em:
- portfólio
- experiência prática
- aplicações reais
- desenvolvimento fullstack profissional