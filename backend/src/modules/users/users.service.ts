import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { normalizePagination } from '../../common/utils/pagination'
import { UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'

type ModuleKey =
  | 'dashboard'
  | 'finance'
  | 'campaigns'
  | 'events'
  | 'donations'
  | 'volunteers'
  | 'gamification'
  | 'certificates'
  | 'members'
  | 'reports'
  | 'organization'
  | 'portal'
  | 'publicPortal'
  | 'campaignInterests'

export type ModuleAccess = {
  module: ModuleKey
  canRead: boolean
  canCreate?: boolean
  canUpdate?: boolean
  canDelete?: boolean
}

const MODULE_KEYS: ModuleKey[] = [
  'dashboard', 'finance', 'campaigns', 'events', 'donations',
  'volunteers', 'gamification', 'certificates', 'members',
  'reports', 'organization', 'portal', 'publicPortal', 'campaignInterests',
]

const buildModuleAccess = (module: ModuleKey, rights: Partial<Omit<ModuleAccess, 'module'>> = {}): ModuleAccess => ({
  module,
  canRead: rights.canRead ?? true,
  canCreate: rights.canCreate ?? false,
  canUpdate: rights.canUpdate ?? false,
  canDelete: rights.canDelete ?? false,
})

const ROLE_MODULE_TEMPLATES: Record<UserRole, ModuleAccess[]> = {
  [UserRole.SUPER_ADMIN]: MODULE_KEYS.map((module) =>
    buildModuleAccess(module, { canCreate: true, canUpdate: true, canDelete: true }),
  ),
  [UserRole.ADMIN]: [
    ...MODULE_KEYS.map((module) => buildModuleAccess(module, { canCreate: module !== 'publicPortal', canUpdate: module !== 'publicPortal' })),
  ],
  [UserRole.COORDINATOR]: [
    buildModuleAccess('dashboard'),
    buildModuleAccess('finance', { canCreate: true, canUpdate: true }),
    buildModuleAccess('campaigns', { canCreate: true, canUpdate: true }),
    buildModuleAccess('events', { canCreate: true, canUpdate: true }),
    buildModuleAccess('donations', { canCreate: true, canUpdate: true }),
    buildModuleAccess('volunteers', { canCreate: true, canUpdate: true }),
    buildModuleAccess('campaignInterests', { canCreate: true, canUpdate: true }),
    buildModuleAccess('members'),
    buildModuleAccess('reports'),
    buildModuleAccess('gamification'),
    buildModuleAccess('certificates'),
    buildModuleAccess('organization'),
    buildModuleAccess('portal'),
    buildModuleAccess('publicPortal'),
  ],
  [UserRole.VOLUNTEER]: [
    buildModuleAccess('portal'),
    buildModuleAccess('publicPortal'),
    buildModuleAccess('volunteers'),
  ],
}

const sanitizeModules = (value?: ModuleAccess[]): ModuleAccess[] => {
  if (!value) return []
  const normalized: Partial<Record<ModuleKey, ModuleAccess>> = {}
  value.forEach((module) => {
    if (!MODULE_KEYS.includes(module.module)) return
    const existing = normalized[module.module]
    normalized[module.module] = {
      module: module.module,
      canRead: module.canRead ?? existing?.canRead ?? true,
      canCreate: module.canCreate ?? existing?.canCreate ?? false,
      canUpdate: module.canUpdate ?? existing?.canUpdate ?? false,
      canDelete: module.canDelete ?? existing?.canDelete ?? false,
    }
  })
  return Object.values(normalized)
}

const defaultModulesForRole = (role: UserRole) =>
  sanitizeModules(ROLE_MODULE_TEMPLATES[role] || ROLE_MODULE_TEMPLATES[UserRole.COORDINATOR])

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async list(orgId: number | undefined, filters?: { page?: number | string; limit?: number | string; search?: string }) {
    const { page, limit, skip } = normalizePagination(filters, 20)
    const where: any = {}
    if (orgId) where.organizationId = orgId
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { organization: true },
      }),
      this.prisma.user.count({ where }),
    ])

    return { data, total, page, totalPages: Math.ceil(total / limit) }
  }

  async getById(id: number, orgId?: number) {
    const where: any = { id }
    if (orgId) where.organizationId = orgId
    const user = await this.prisma.user.findFirst({
      where,
      include: { organization: true },
    })
    if (!user) throw new NotFoundException('Usuário não encontrado')
    return user
  }

  async create(
    orgId: number | undefined,
    data: {
      name: string
      email: string
      password: string
      role?: UserRole
      organizationId?: number
      modules?: ModuleAccess[]
    },
  ) {
    const targetOrg = orgId ?? data.organizationId
    if (!targetOrg) throw new NotFoundException('Organização obrigatória')

    const exists = await this.prisma.user.findUnique({ where: { email: data.email } })
    if (exists) throw new ConflictException('Email já cadastrado')

    const passwordHash = await bcrypt.hash(data.password, 10)
    const assignedRole = data.role ?? UserRole.COORDINATOR
    const requestedModules = sanitizeModules(data.modules)
    const modules = requestedModules.length ? requestedModules : defaultModulesForRole(assignedRole)
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: assignedRole,
        organizationId: targetOrg,
        modules,
      },
      include: { organization: true },
    })
  }

  async update(
    id: number,
    orgId: number | undefined,
    data: {
      name?: string
      email?: string
      role?: UserRole
      password?: string
      isActive?: boolean
      modules?: ModuleAccess[]
    },
  ) {
    const where: any = { id }
    if (orgId) where.organizationId = orgId
    const user = await this.prisma.user.findFirst({ where })
    if (!user) throw new NotFoundException('Usuário não encontrado')

    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.email) updateData.email = data.email
    if (data.role) updateData.role = data.role
    if (typeof data.isActive === 'boolean') updateData.isActive = data.isActive
    if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 10)
    if (data.modules) {
      updateData.modules = sanitizeModules(data.modules)
    } else if (data.role) {
      updateData.modules = defaultModulesForRole(data.role)
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: updateData,
      include: { organization: true },
    })
  }

  async remove(id: number, orgId: number | undefined) {
    const where: any = { id }
    if (orgId) where.organizationId = orgId
    const user = await this.prisma.user.findFirst({ where })
    if (!user) throw new NotFoundException('Usuário não encontrado')

    return this.prisma.user.update({
      where: { id: user.id },
      data: { isActive: false },
      include: { organization: true },
    })
  }
}
