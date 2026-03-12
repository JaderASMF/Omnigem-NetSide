import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ServiceTypesService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.serviceType.findMany({ orderBy: { name: 'asc' } })
  }

  get(id: number) {
    return this.prisma.serviceType.findUnique({ where: { id } })
  }

  async create(data: { name: string; code?: string; description?: string }) {
    let code = data.code
    if (!code) {
      const rows = await this.prisma.serviceType.findMany({ select: { code: true } })
      const nums = rows.map(r => Number(r.code)).filter(n => !isNaN(n))
      const max = nums.length ? Math.max(...nums) : 0
      code = String(max + 1)
    }
    return this.prisma.serviceType.create({ data: { ...data, code } })
  }

  update(id: number, data: { name?: string; code?: string; description?: string }) {
    return this.prisma.serviceType.update({ where: { id }, data })
  }

  async remove(id: number) {
    return this.prisma.serviceType.delete({ where: { id } })
  }
}
