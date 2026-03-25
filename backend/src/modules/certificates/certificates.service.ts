import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { CertificateType } from '@prisma/client'
import { normalizePagination } from '../../common/utils/pagination'

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  /** Gera um código único no formato VOL-YYYY-XXXXXX */
  private generateCode(): string {
    const year = new Date().getFullYear()
    const random = Math.random().toString(36).toUpperCase().substring(2, 8)
    return `VOL-${year}-${random}`
  }

  async findAll(orgId: number, filters?: { volunteerId?: number; tipo?: CertificateType; page?: number | string; limit?: number | string }) {
    const { volunteerId, tipo } = filters || {}
    const { page, limit, skip } = normalizePagination(filters, 20)
    const where: any = { organizationId: orgId, revogado: false }
    if (volunteerId) where.volunteerId = volunteerId
    if (tipo) where.tipo = tipo

    const [data, total] = await Promise.all([
      this.prisma.certificate.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          volunteer: { select: { id: true, nome: true, email: true, profissao: true } },
          campaign: { select: { id: true, nome: true } },
        },
      }),
      this.prisma.certificate.count({ where }),
    ])
    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: number, orgId: number) {
    const cert = await this.prisma.certificate.findFirst({
      where: { id, organizationId: orgId },
      include: {
        volunteer: true,
        campaign: true,
        organization: { select: { id: true, name: true, logoUrl: true, email: true, city: true, state: true } },
      },
    })
    if (!cert) throw new NotFoundException('Certificado não encontrado')
    return cert
  }

  /** Verificação pública por código — sem autenticação */
  async verifyByCodigo(codigo: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { codigo },
      include: {
        volunteer: { select: { id: true, nome: true, profissao: true } },
        campaign: { select: { id: true, nome: true } },
        organization: { select: { id: true, name: true, logoUrl: true, city: true, state: true } },
      },
    })
    if (!cert) throw new NotFoundException('Certificado não encontrado ou código inválido')

    return {
      valido: !cert.revogado,
      revogado: cert.revogado,
      motivoRevogacao: cert.revogado ? cert.motivoRevogacao : undefined,
      certificado: cert.revogado ? null : cert,
    }
  }

  async create(orgId: number, data: {
    volunteerId: number
    tipo?: CertificateType
    titulo: string
    descricao?: string
    horasCertificadas?: number
    dataAtividade?: string
    dataValidade?: string
    campaignId?: number
    assinante?: string
    cargoAssinante?: string
    emitidoPor?: string
  }) {
    // Verifica se o voluntário pertence à org
    const volunteer = await this.prisma.volunteer.findFirst({
      where: { id: data.volunteerId, organizationId: orgId },
    })
    if (!volunteer) throw new BadRequestException('Voluntário não encontrado nesta organização')

    let codigo: string
    let exists = true
    while (exists) {
      codigo = this.generateCode()
      const found = await this.prisma.certificate.findUnique({ where: { codigo } })
      exists = !!found
    }

    return this.prisma.certificate.create({
      data: {
        ...data,
        codigo: codigo!,
        tipo: data.tipo || CertificateType.PARTICIPATION,
        dataAtividade: data.dataAtividade ? new Date(data.dataAtividade) : undefined,
        dataValidade: data.dataValidade ? new Date(data.dataValidade) : undefined,
        organizationId: orgId,
      },
      include: {
        volunteer: { select: { id: true, nome: true, email: true } },
        campaign: { select: { id: true, nome: true } },
        organization: { select: { id: true, name: true } },
      },
    })
  }

  async issueBulk(orgId: number, data: {
    volunteerIds: number[]
    tipo?: CertificateType
    titulo: string
    descricao?: string
    horasCertificadas?: number
    campaignId?: number
    assinante?: string
    cargoAssinante?: string
    emitidoPor?: string
  }) {
    const results = []
    for (const volunteerId of data.volunteerIds) {
      try {
        const cert = await this.create(orgId, { ...data, volunteerId })
        results.push({ volunteerId, success: true, certificado: cert })
      } catch (e: any) {
        results.push({ volunteerId, success: false, error: e.message })
      }
    }
    return { total: data.volunteerIds.length, emitidos: results.filter(r => r.success).length, results }
  }

  async revoke(id: number, orgId: number, motivoRevogacao: string) {
    await this.findOne(id, orgId)
    return this.prisma.certificate.update({
      where: { id },
      data: { revogado: true, motivoRevogacao },
    })
  }

  async getStats(orgId: number) {
    const [total, porTipo, recentes] = await Promise.all([
      this.prisma.certificate.count({ where: { organizationId: orgId, revogado: false } }),
      this.prisma.certificate.groupBy({
        by: ['tipo'],
        where: { organizationId: orgId, revogado: false },
        _count: true,
      }),
      this.prisma.certificate.findMany({
        where: { organizationId: orgId, revogado: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { volunteer: { select: { nome: true } }, campaign: { select: { nome: true } } },
      }),
    ])
    return { total, porTipo, recentes }
  }
}
