import { MembersService } from './members.service';
export declare class MembersController {
    private service;
    constructor(service: MembersService);
    findAll(user: any, search?: string, role?: string, page?: number): Promise<{
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
    getStats(user: any): Promise<{
        total: number;
        active: number;
        byRole: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.MemberGroupByOutputType, "role"[]> & {
            _count: number;
        })[];
        byDept: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.MemberGroupByOutputType, "departamento"[]> & {
            _count: number;
        })[];
    }>;
    findOne(id: number, user: any): Promise<{
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
    create(user: any, body: any): Promise<{
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
    update(id: number, user: any, body: any): Promise<{
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
    deactivate(id: number, user: any): Promise<{
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
}
