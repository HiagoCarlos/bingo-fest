// backend/src/sockets/gameSocket.ts
import { Server, Socket } from 'socket.io';
import prisma from '../config/prisma';
import { DrawService } from '../services/DrawService';

export function setupGameSockets(io: Server) {
  io.on('connection', (socket: Socket) => {
    
    socket.on('join_room', ({ roomId, habboNick }) => {
      socket.join(roomId);
      io.to(roomId).emit('player_joined', habboNick);
    });

    socket.on('send_message', ({ roomId, habboNick, message }) => {
      io.to(roomId).emit('receive_message', { habboNick, message });
    });

    socket.on('toggle_lock', async ({ roomId, isLocked }) => {
      try {
        const newStatus = isLocked ? 'PLAYING' : 'WAITING';
        await prisma.room.update({ where: { id: roomId }, data: { status: newStatus } });
        io.to(roomId).emit('room_lock_state', isLocked);
      } catch (e) {}
    });

   
    socket.on('start_game', async (roomId: string) => {
      try {
        await prisma.room.update({ where: { id: roomId }, data: { status: 'PLAYING' } });
        DrawService.initializeRoom(roomId); 
        io.to(roomId).emit('game_started');
        io.to(roomId).emit('room_lock_state', true); 
      } catch (e) {}
    });

    socket.on('draw_ball', async (roomId: string) => {
      try {
        const ball = await DrawService.drawNext(roomId);
        io.to(roomId).emit('new_ball', ball);
      } catch (error: any) {
        socket.emit('error', error.message);
      }
    });

    socket.on('claim_bingo', async ({ roomId, playerId }) => {
      try {
        const room = await prisma.room.findUnique({ where: { id: roomId }, include: { draws: true } });
        const player = await prisma.player.findUnique({ where: { id: playerId } });
        if (!room || !player) return;

        const draws = room.draws.map(d => d.ball);
        const card = player.card as any;
        const cols = ['B', 'I', 'N', 'G', 'O'];

        const isMarked = (col: string, r: number) => {
          const val = card[col][r];
          if (val === 'FREE') return true;
          return draws.includes(`${col}-${val}`);
        };

        let hasBingo = false;
        for (let i = 0; i < 5; i++) {
          if (cols.every(c => isMarked(c, i))) hasBingo = true;
          if ([0, 1, 2, 3, 4].every(r => isMarked(cols[i], r))) hasBingo = true;
        }
        if ([0, 1, 2, 3, 4].every(i => isMarked(cols[i], i))) hasBingo = true;
        if ([0, 1, 2, 3, 4].every(i => isMarked(cols[i], 4 - i))) hasBingo = true;

        if (hasBingo) {
          await prisma.player.update({ where: { id: playerId }, data: { isWinner: true } });
          await prisma.room.update({ where: { id: roomId }, data: { status: 'FINISHED' } });
          io.to(roomId).emit('bingo_winner', player.habboNick);
        } else {
          socket.emit('bingo_invalid', 'OLHA A COBRA! É MENTIRA! Sua cartela ainda não bateu.');
        }
      } catch (error) {
        console.error("Erro ao validar bingo", error);
      }
    });

    socket.on('kick_player', ({ roomId, habboNick }) => {
      io.to(roomId).emit('player_kicked', habboNick);
    });

    socket.on('delete_room', (roomId: string) => {
      io.to(roomId).emit('room_closed'); 
    });

    socket.on('redirect_room', ({ roomId, newRoomCode }) => {
      io.to(roomId).emit('force_redirect', newRoomCode);
    });

  });
}