import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkersService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.worker.findMany({ orderBy: { name: 'asc' } });
  }

  get(id: number) {
    return this.prisma.worker.findUnique({ where: { id } });
  }

  create(data: { name: string; email?: string; color?: string }) {
    return this.prisma.worker.create({ data });
  }

  update(id: number, data: { name?: string; email?: string; color?: string; active?: boolean }) {
    return this.prisma.worker.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.worker.delete({ where: { id } });
  }
}
