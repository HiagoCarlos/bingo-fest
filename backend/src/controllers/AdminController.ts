// src/controllers/AdminController.ts
import { Request, Response } from 'express';
import prisma from '../config/prisma';

export class AdminController {
  // Login (mantido como estava)
  public static login(req: Request, res: Response) {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!password) return res.status(400).json({ error: 'Senha é obrigatória.' });
    if (password !== adminPassword) return res.status(401).json({ error: 'Senha incorreta.' });

    return res.status(200).json({ token: 'auth-admin-token-valid' });
  }

  // NOVA FUNÇÃO: O "Olho que Tudo Vê" do Super Admin
  public static async getDashboardData(req: Request, res: Response) {
    try {
      // Busca todas as salas, trazendo os jogadores e as pedras sorteadas de cada uma
      const rooms = await prisma.room.findMany({
        include: {
          players: {
            select: { id: true, habboNick: true, isWinner: true } // Não precisamos trazer a cartela inteira aqui pra não pesar
          },
          draws: true,
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json(rooms);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar dados do painel do Admin.' });
    }
  }
}