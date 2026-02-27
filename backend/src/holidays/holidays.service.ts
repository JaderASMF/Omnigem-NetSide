import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HolidaysService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.holiday.findMany({ orderBy: { date: 'desc' } });
  }

  get(id: number) {
    return this.prisma.holiday.findUnique({ where: { id } });
  }

  create(data: { date: string; name?: string; recurring?: boolean }) {
    return this.prisma.holiday.create({
      data: { date: new Date(data.date), name: data.name, recurring: !!data.recurring },
    });
  }

  update(id: number, data: { date?: string; name?: string; recurring?: boolean }) {
    const updateData: any = { ...data };
    if (updateData.date) updateData.date = new Date(updateData.date);
    return this.prisma.holiday.update({ where: { id }, data: updateData });
  }

  remove(id: number) {
    return this.prisma.holiday.delete({ where: { id } });
  }
}
