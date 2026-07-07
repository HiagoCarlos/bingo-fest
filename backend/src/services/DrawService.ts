// src/services/DrawService.ts
import prisma from '../config/prisma';
import { roomStates } from '../utils/gameState';

export class DrawService {
  /**
   * Prepara a sala na memória com todas as 75 pedras.
   */
  public static initializeRoom(roomId: string) {
    const letters = ['B', 'I', 'N', 'G', 'O'];
    const availableBalls: string[] = [];

    letters.forEach((letter, index) => {
      const min = index * 15 + 1;
      const max = min + 14; // Ex: B (1 a 15)
      for (let i = min; i <= max; i++) {
        availableBalls.push(`${letter}-${i}`);
      }
    });

    // Salva na memória
    roomStates.set(roomId, { availableBalls, drawnBalls: [] });
  }

  /**
   * Sorteia a próxima pedra, remove da urna e salva no banco.
   */
  public static async drawNext(roomId: string) {
    const state = roomStates.get(roomId);
    
    if (!state) throw new Error('Partida não iniciada na memória.');
    if (state.availableBalls.length === 0) throw new Error('Todas as pedras já foram sorteadas.');

    // Sorteia um índice aleatório e remove a pedra do array de disponíveis
    const randomIndex = Math.floor(Math.random() * state.availableBalls.length);
    const ball = state.availableBalls.splice(randomIndex, 1)[0];
    
    // Adiciona na lista de pedras já sorteadas
    state.drawnBalls.push(ball);

    // Salva no banco de dados para histórico (assíncrono para não travar o Node)
    await prisma.draw.create({
      data: { roomId, ball }
    });

    return ball;
  }
}