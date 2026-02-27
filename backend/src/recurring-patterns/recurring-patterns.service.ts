import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecurringPatternsService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.recurringPattern.findMany({ orderBy: { id: 'asc' } });
  }

  get(id: number) {
    return this.prisma.recurringPattern.findUnique({ where: { id } });
  }

  create(data: {
    workerId: number;
    weekdays: number[];
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    note?: string | null;
  }) {
    return this.prisma.recurringPattern.create({ data });
  }

  update(id: number, data: Partial<{ workerId: number; weekdays: number[]; startDate?: Date | string | null; endDate?: Date | string | null; note?: string | null }>) {
    return this.prisma.recurringPattern.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.recurringPattern.delete({ where: { id } });
  }
}
