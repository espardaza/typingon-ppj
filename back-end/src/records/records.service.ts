import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecordsService {
  constructor(private prisma: PrismaService) {}

  async saveRecord(
    username: string,
    wpm: number,
    errors: number,
    words?: number,
    time?: number,
  ) {
    // 1. Find the user in the database based on the username
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    // 2. Save the record to the Record table, linking it to the user's ID
    const newRecord = await this.prisma.record.create({
      data: {
        wpm,
        errors,
        ...(words !== undefined && { words }),
        ...(time !== undefined && { time }),
        userId: user.id, // Foreign key linking to the User table
      },
    });

    return {
      message: 'Record saved successfully!',
      record: newRecord,
    };
  }

  // Get all records for a specific user
  async getRecords(username: string) {
    return this.prisma.record.findMany({
      where: {
        user: { username },
      },
      orderBy: {
        createdAt: 'desc', // Show the newest records first
      },
    });
  }

  // --- Delete a single record by ID ---
  async deleteRecord(id: string) {
    return this.prisma.record.delete({
      where: { id },
    });
  }

  // --- Delete all records for a specific user ---
  async deleteAllRecords(username: string) {
    return this.prisma.record.deleteMany({
      where: {
        user: { username },
      },
    });
  }
}
