import { PrismaService } from '../../prisma.service';
export declare class MembersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(orgId: number, filters?: {
        search?: string;
        role?: string;
        isActive?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            id: number;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.MemberRole;
            avatarUrl: string | null;
            isActive: boolean;
            organizationId: number;
            nome: string;
            cargo: string | null;
            departamento: string | null;
            telefone: string | null;
            bio: string | null;
            dataIngresso: Date;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: number, orgId: number): Promise<{
        id: number;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.MemberRole;
        avatarUrl: string | null;
        isActive: boolean;
        organizationId: number;
        nome: string;
        cargo: string | null;
        departamento: string | null;
        telefone: string | null;
        bio: string | null;
        dataIngresso: Date;
    }>;
    create(orgId: number, data: any): Promise<{
        id: number;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.MemberRole;
        avatarUrl: string | null;
        isActive: boolean;
        organizationId: number;
        nome: string;
        cargo: string | null;
        departamento: string | null;
        telefone: string | null;
        bio: string | null;
        dataIngresso: Date;
    }>;
    update(id: number, orgId: number, data: any): Promise<{
        id: number;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.MemberRole;
        avatarUrl: string | null;
        isActive: boolean;
        organizationId: number;
        nome: string;
        cargo: string | null;
        departamento: string | null;
        telefone: string | null;
        bio: string | null;
        dataIngresso: Date;
    }>;
    deactivate(id: number, orgId: number): Promise<{
        id: number;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.MemberRole;
        avatarUrl: string | null;
        isActive: boolean;
        organizationId: number;
        nome: string;
        cargo: string | null;
        departamento: string | null;
        telefone: string | null;
        bio: string | null;
        dataIngresso: Date;
    }>;
    getStats(orgId: number): Promise<{
        total: number;
        active: number;
        byRole: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.MemberGroupByOutputType, "role"[]> & {
            _count: number;
        })[];
        byDept: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.MemberGroupByOutputType, "departamento"[]> & {
            _count: number;
        })[];
    }>;
}
