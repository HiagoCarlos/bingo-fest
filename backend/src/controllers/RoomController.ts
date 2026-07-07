// src/controllers/RoomController.ts
import { Request, Response } from 'express';
import { RoomService } from '../services/RoomService';
import prisma from '../config/prisma'; // <- Adicione este import

export class RoomController {
  // Mantém o create que já existe...
  public static async create(req: Request, res: Response) {
    try {
      const { code } = req.body;
      if (!code) return res.status(400).json({ error: 'Código obrigatório.' });
      const room = await RoomService.createRoom(code);
      return res.status(201).json(room);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // NOVA FUNÇÃO: Buscar detalhes de uma sala (com jogadores e pedras)
  public static async getRoom(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) return res.status(400).json({ error: 'ID obrigatório.' });

      const room = await prisma.room.findUnique({
        where: { id },
        include: { players: true, draws: true }
      });
      if (!room) return res.status(404).json({ error: 'Sala não encontrada.' });
      return res.status(200).json(room);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao buscar sala.' });
    }
  }

  // NOVA FUNÇÃO: Excluir sala
  public static async deleteRoom(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) return res.status(400).json({ error: 'ID obrigatório.' });

      await prisma.room.delete({ where: { id } });
      return res.status(200).json({ message: 'Sala excluída com sucesso.' });
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao excluir sala.' });
    }
  }
}