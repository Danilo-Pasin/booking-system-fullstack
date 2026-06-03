# Projeto Booking System

Objetivo:
Projeto acadêmico de POO + Clean Architecture.

Regras:

- Nunca alterar múltiplas fases simultaneamente.
- Sempre apresentar plano antes de implementar.
- Priorizar segurança e integridade dos dados.
- Não remover funcionalidades existentes.
- Explicar todas as alterações realizadas.
- Executar testes após mudanças.
- Confirmar antes de grandes refatorações.
- Todo texto em português (pt-BR).

Stack:
- TypeScript
- Fastify
- Prisma + PostgreSQL (Neon)
- Next.js
- Tailwind
- Cloudinary (upload de imagens)

Arquitetura:

domain/
application/
infra/
frontend/

## Features

### Booking Status
- Toda reserva começa como `PENDING`
- Host aprova (`APPROVED`) ou rejeita (`REJECTED`) via `PATCH /bookings/:id/status`
- Guest pode cancelar (`DELETE /bookings/:id`) — status vira `CANCELED`
- Conflito de datas considera bookings PENDING + APPROVED (não REJECTED nem CANCELED)
- `BookingStatus` type: `"PENDING" | "APPROVED" | "REJECTED" | "CANCELED"`

### Autenticação
- JWT em cookie HttpOnly + Authorization header (dual)
- Rate limit: 10/min em login/register, 1000/min global
- Senha com bcrypt cost 12, mínimo 8 caracteres

### Imagens
- Cloudinary para upload de fotos (perfil + acomodações)
- Seed com URLs Unsplash

### Testes
- 139 testes, 27 arquivos, 100% dos 20 use cases cobertos
- `npm test` no diretório booking-system
- Nenhum teste no frontend ainda

## Deploy
- Backend: Railway (Dockerfile incluso)
- Frontend: Vercel (vercel.json incluso)
- Variáveis de ambiente documentadas em `.env.example`
