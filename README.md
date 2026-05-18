# Booking System

Sistema fullstack de reservas inspirado em plataformas como Airbnb e Booking.com, desenvolvido com foco em arquitetura profissional, Clean Architecture, autenticação JWT e integração completa entre frontend e backend.

---

# Preview

> Em breve:
- screenshots
- GIFs
- deploy online

---

# Tecnologias

## Backend
- TypeScript
- Fastify
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt

## Frontend
- Next.js 16
- React
- Tailwind CSS

## Banco de Dados
- PostgreSQL (Neon)

---

# Estrutura do Projeto

```txt
booking-system-fullstack/
├── booking-system/       ← Backend/API
└── booking-frontend/     ← Frontend Next.js
```

---

# Funcionalidades

- Cadastro de usuários
- Login JWT
- Listagem de acomodações
- Visualização de detalhes
- Preview de preços
- Criação de reservas
- Listagem de reservas
- Controle de disponibilidade
- Persistência em PostgreSQL

---

# Arquitetura

O projeto segue princípios de:

- Clean Architecture
- SOLID
- Repository Pattern
- DDD
- Separation of Concerns

---

# Execução Local

## Backend

```bash
cd booking-system
npm install
npm run server
```

Servidor:
```txt
http://localhost:3001
```

---

## Frontend

```bash
cd booking-frontend
npm install
npm run dev
```

Aplicação:
```txt
http://localhost:3000
```

---

# Roadmap

## Backend
- [x] JWT Authentication
- [x] Prisma ORM
- [x] PostgreSQL
- [x] Booking system
- [ ] Swagger
- [ ] Zod validation
- [ ] Unit tests
- [ ] Ownership validation

## Frontend
- [x] Login
- [x] Register
- [x] Bookings page
- [ ] Loading states
- [ ] Toast notifications
- [ ] Search and filters
- [ ] Responsive improvements

---

# Deploy

Planejado:

- Frontend → Vercel
- Backend → Railway

---

# Objetivo do Projeto

Projeto desenvolvido para estudo avançado de:

- arquitetura backend
- aplicações fullstack
- autenticação
- banco de dados relacional
- integração frontend/backend
- padrões de projeto
- engenharia de software

com foco em construção de portfólio profissional.
