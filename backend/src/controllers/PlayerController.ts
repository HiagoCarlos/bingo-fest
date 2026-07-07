// src/controllers/PlayerController.ts
import { Request, Response } from 'express';
import { PlayerService } from '../services/PlayerService';

export class PlayerController {
  public static async join(req: Request, res: Response) {
    try {
      const { habboNick, roomCode } = req.body;
      if (!habboNick || !roomCode) {
        return res.status(400).json({ error: 'Nick do Habbo e Código da Sala são obrigatórios.' });
      }

      const player = await PlayerService.joinRoom(habboNick, roomCode);
      return res.status(200).json(player);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}