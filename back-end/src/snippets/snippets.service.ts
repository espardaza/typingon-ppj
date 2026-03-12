import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SnippetsService {
  constructor(private prisma: PrismaService) {}

  async create(
    username: string,
    content: string,
    defaultTime: number,
    tags: string[],
  ) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('User not found!');

    return this.prisma.snippet.create({
      data: {
        content,
        defaultTime: defaultTime || 60,
        tags: tags || [],
        userId: user.id,
      },
    });
  }

  async findAll(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('User not found!');

    return this.prisma.snippet.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteOne(id: string) {
    return this.prisma.snippet.delete({
      where: { id },
    });
  }

  async deleteAll(username: string) {
    const user = await this.prisma.user.findFirst({
      where: { username },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.prisma.snippet.deleteMany({
      where: { userId: user.id },
    });
  }
}
