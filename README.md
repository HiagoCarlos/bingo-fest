# 🌽 Arraiá Bingo

Sistema de Bingo Multiplayer em tempo real com temática de Festa Junina. Desenvolvido para eventos interativos no Habbo Hotel, com validação anti-cheat, chat global e painel de controle Host.

## ✨ Funcionalidades
- 🕹️ **Jogadores:** Cartelas geradas automaticamente, auto-mark (marcação da pedra na tela), chat (Correio Elegante), áudio imersivo (sanfona e alertas) e efeitos visuais CSS (confetes, balões, pisca-pisca).
- 👑 **Host (Admin):** Controle de sala (travar/destravar entradas a qualquer momento), sorteio de pedras, sistema de expulsão (kick), chat VIP em roxo e validação automática de BINGO que trava a sala.

## 🛠️ Tecnologias
- **Frontend:** React (Vite), TypeScript, Tailwind CSS, Socket.io-client, Canvas-Confetti.
- **Backend:** Node.js, Express, Socket.io, Prisma ORM, PostgreSQL.

## 🚀 Como Executar

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git](https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git)
2. **Backend (Terminal 1):** 
- cd backend
- npm install
- Crie um arquivo .env com: DATABASE_URL="postgresql://user:pass@localhost:5432/db" e PORT=3333
- npx prisma migrate dev
- npm run dev

3. **Frontend (Terminal 2):**
- cd frontend
- npm install
- Crie um arquivo .env com: VITE_API_URL=http://localhost:3333/api
- npm run dev
- (Acesso ao Painel da Diretoria/Admin pela rota: http://localhost:5173/admin)


## 👨‍💻 Autor
- Hiago - Desenvolvedor Full Stack & Mobile