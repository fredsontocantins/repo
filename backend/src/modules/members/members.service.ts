import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: number, filters?: { search?: string; role?: string; isActive?: boolean; page?: number; limit?: number }) {
    const { search, role, isActive, page = 1, limit = 20 } = filters || {}
    const skip = (page - 1) * limit
    const where: any = { organizationId: orgId }
    if (role) where.role = role
    if (isActive !== undefined) where.isActive = isActive
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cargo: { contains: search, mode: 'insensitive' } },
        { departamento: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      this.prisma.member.findMany({ where, skip, take: limit, orderBy: { nome: 'asc' } }),
      this.prisma.member.count({ where }),
    ])
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number, orgId: number) {
    const member = await this.prisma.member.findFirst({ where: { id, organizationId: orgId } })
    if (!member) throw new NotFoundException('Membro não encontrado')
    return member
  }

  async create(orgId: number, data: any) {
    return this.prisma.member.create({ data: { ...data, organizationId: orgId } })
  }

  async update(id: number, orgId: number, data: any) {
    await this.findOne(id, orgId)
    return this.prisma.member.update({ where: { id }, data })
  }

  async deactivate(id: number, orgId: number) {
    await this.findOne(id, orgId)
    return this.prisma.member.update({ where: { id }, data: { isActive: false } })
  }

  async getStats(orgId: number) {
    const [total, active, byRole, byDept] = await Promise.all([
      this.prisma.member.count({ where: { organizationId: orgId } }),
      this.prisma.member.count({ where: { organizationId: orgId, isActive: true } }),
      this.prisma.member.groupBy({ by: ['role'], where: { organizationId: orgId }, _count: true }),
      this.prisma.member.groupBy({
        by: ['departamento'],
        where: { organizationId: orgId, departamento: { not: null } },
        _count: true,
        orderBy: { _count: { departamento: 'desc' } },
      }),
    ])
    return { total, active, byRole, byDept }
  }
}
