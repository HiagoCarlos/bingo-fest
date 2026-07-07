import prisma from '../config/prisma';
import { CardService } from './CardService';

export class PlayerService {
  public static async joinRoom(habboNick: string, roomCode: string) {
   
    const room = await prisma.room.findUnique({ where: { code: roomCode } });
    if (!room) throw new Error('Sala não encontrada.');
    if (room.status !== 'WAITING') throw new Error('Esta partida já começou ou foi encerrada.');

   
    const existingPlayer = await prisma.player.findUnique({
      where: {
        habboNick_roomId: {
          habboNick,
          roomId: room.id
        }
      }
    });

    if (existingPlayer) {
      return existingPlayer; 
    }

    const newCard = CardService.generateCard();

    const player = await prisma.player.create({
      data: {
        habboNick,
        roomId: room.id,
        card: newCard as any 
      }
    });

    return player;
  }
}