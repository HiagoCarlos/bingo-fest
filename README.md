# 🌽 Arraiá Bingo - Companhia Treinadores

Um sistema completo de **Bingo Multiplayer em Tempo Real**, com temática de Festa Junina (Arraiá) e inspiração visual em Pixel Art/Habbo Hotel. Desenvolvido para gerenciar eventos interativos com sincronização via WebSockets, validação anti-cheat do lado do servidor e uma interface visualmente imersiva.

![Status](https://img.shields.io/badge/Status-Concluído-success)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)

---

## 🎯 Funcionalidades

### 🕹️ Visão do Jogador (Client)
* **Cartelas Geradas Automaticamente:** Cada jogador recebe uma cartela 5x5 única.
* **Auto-Mark (Marcação Automática):** O sistema marca os números automaticamente na cartela à medida que são sorteados.
* **Correio Elegante (Chat Global):** Bate-papo em tempo real integrado.
* **Mural de Informações:** Modal no estilo "Literatura de Cordel" com regras e premiações.
* **Música e Efeitos Sonoros:** Player de áudio (Sanfona) e efeitos sonoros retrô (SFX) usando a Web Audio API.
* **Efeitos Especiais (CSS):** Balões flutuantes, animações de brilho (glow), confetes na vitória e luzes pisca-pisca.

### 👑 Visão do Administrador (Host Panel)
* **Controle Total da Sala:** Capacidade de criar, excluir e monitorar as barracas (salas).
* **Trava Dinâmica (Lock/Unlock):** O Host pode abrir ou fechar as entradas de novos jogadores a qualquer momento.
* **Monitoramento ao Vivo:** Lista em tempo real de quem está online.
* **Sistema de Punição (Kick):** Expulsão de jogadores bagunceiros com apenas um clique.
* **Chat Destacado:** Mensagens do Host ganham a tag 👑 **DIRETORIA** na cor roxa para destaque no Correio Elegante.
* **Validador Anti-Cheat (Bingo Automático):** O botão "Gritar Bingo" valida matematicamente a cartela no back-end. Se o jogador mentir, ele recebe um alerta; se for verdade, a sala é trancada e o jogo se encerra.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
* **React** (Vite)
* **TypeScript**
* **Tailwind CSS** (Para estilização, efeitos Neon/Glow e responsividade)
* **Socket.io-client** (Comunicação em tempo real)
* **Canvas-Confetti** (Efeitos visuais de vitória)

### Backend
* **Node.js** com **Express**
* **TypeScript**
* **Socket.io** (Servidor de WebSockets)
* **Prisma ORM** (Modelagem de banco de dados)
* **PostgreSQL** (Banco de dados relacional)

---

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/en/) (Versão 18+)
* Banco de Dados [PostgreSQL](https://www.postgresql.org/) rodando localmente ou na nuvem (ex: Supabase, Render).

### 1. Clonando o Repositório
```bash
git clone [https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git](https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git)
cd SEU_REPOSITORIO