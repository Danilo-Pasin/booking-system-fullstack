# Booking Frontend

Frontend da aplicação Booking System, desenvolvido com Next.js 16, React e Tailwind CSS.

Interface responsável por:

- autenticação
- listagem de acomodações
- visualização de reservas
- integração com API Fastify

---

# Stack

- Next.js 16
- React
- TypeScript
- Tailwind CSS

---

# Funcionalidades

- Login
- Cadastro
- Listagem de acomodações
- Página de detalhes
- Preview de preços
- Criação de reservas
- Listagem de reservas do usuário

---

# Estrutura

```txt
app/
├── login/
├── register/
├── bookings/
├── accommodations/
│   └── [id]/
```

---

# Integração com API

O frontend consome a API backend via:

```txt
http://localhost:3001
```

Arquivo responsável:

```txt
lib/api.ts
```

---

# Execução Local

```bash
npm install
npm run dev
```

Aplicação disponível em:

```txt
http://localhost:3000
```

---

# Melhorias Futuras

- loading states
- tratamento de erros
- toasts
- busca e filtros
- responsividade avançada
- dark/light mode

---

# Objetivo

Projeto criado para estudo de:

- aplicações fullstack
- integração frontend/backend
- autenticação JWT
- arquitetura moderna React
- consumo de APIs REST