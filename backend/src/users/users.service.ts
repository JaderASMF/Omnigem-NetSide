import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, roles: true, createdAt: true },
      orderBy: { id: 'asc' },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, roles: true, createdAt: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(email: string, password: string, roles: string[], name?: string) {
    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { email, password: hashed, roles: roles as any, name },
      select: { id: true, email: true, name: true, roles: true, createdAt: true },
    });
  }

  async update(id: number, data: { email?: string; password?: string; roles?: string[]; name?: string }) {
    const updateData: any = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.roles !== undefined) updateData.roles = data.roles;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);
    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, roles: true, createdAt: true },
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async createAdmin(email: string, password: string, name?: string) {
    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.upsert({
      where: { email },
      update: { password: hashed, roles: ['ADMIN'], name },
      create: { email, password: hashed, roles: ['ADMIN'], name },
    });
  }
}
