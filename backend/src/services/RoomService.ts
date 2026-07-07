import prisma from '../config/prisma';

export class RoomService {
  public static async createRoom(code: string) {
    
    const existingRoom = await prisma.room.findUnique({ where: { code } });
    
    if (existingRoom) {
      throw new Error('Já existe uma sala com este código.');
    }


    const room = await prisma.room.create({
      data: { code }
    });

    return room;
  }
}