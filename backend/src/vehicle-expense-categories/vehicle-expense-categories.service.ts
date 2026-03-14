import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class VehicleExpenseCategoriesService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.vehicleExpenseCategory.findMany({ orderBy: { name: 'asc' } })
  }

  get(id: number) {
    return this.prisma.vehicleExpenseCategory.findUnique({ where: { id } })
  }

  async create(data: any) {
    return this.prisma.vehicleExpenseCategory.create({ data })
  }

  async update(id: number, data: any) {
    const cat = await this.prisma.vehicleExpenseCategory.findUnique({ where: { id } })
    if (!cat) throw new NotFoundException('Category not found')
    return this.prisma.vehicleExpenseCategory.update({ where: { id }, data })
  }

  remove(id: number) {
    return this.prisma.vehicleExpenseCategory.delete({ where: { id } })
  }
}
