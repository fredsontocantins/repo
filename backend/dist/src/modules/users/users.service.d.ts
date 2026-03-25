import { PrismaService } from '../../prisma.service';
import { UserRole } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    list(orgId: number | undefined, filters?: {
        page?: number | string;
        limit?: number | string;
        search?: string;
    }): Promise<{
        data: ({
            organization: {
                id: number;
                slug: string;
                name: string;
                description: string | null;
                website: string | null;
                logoUrl: string | null;
                email: string | null;
                phone: string | null;
                address: string | null;
                city: string | null;
                state: string | null;
                cnpj: string | null;
                portalAtivo: boolean;
                portalDescricao: string | null;
                portalCorPrimaria: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            name: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatarUrl: string | null;
            isActive: boolean;
            organizationId: number | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getById(id: number, orgId?: number): Promise<{
        organization: {
            id: number;
            slug: string;
            name: string;
            description: string | null;
            website: string | null;
            logoUrl: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
            city: string | null;
            state: string | null;
            cnpj: string | null;
            portalAtivo: boolean;
            portalDescricao: string | null;
            portalCorPrimaria: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        name: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        isActive: boolean;
        organizationId: number | null;
    }>;
    create(orgId: number | undefined, data: {
        name: string;
        email: string;
        password: string;
        role?: UserRole;
        organizationId?: number;
    }): Promise<{
        organization: {
            id: number;
            slug: string;
            name: string;
            description: string | null;
            website: string | null;
            logoUrl: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
            city: string | null;
            state: string | null;
            cnpj: string | null;
            portalAtivo: boolean;
            portalDescricao: string | null;
            portalCorPrimaria: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        name: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        isActive: boolean;
        organizationId: number | null;
    }>;
    update(id: number, orgId: number | undefined, data: {
        name?: string;
        email?: string;
        role?: UserRole;
        password?: string;
        isActive?: boolean;
    }): Promise<{
        organization: {
            id: number;
            slug: string;
            name: string;
            description: string | null;
            website: string | null;
            logoUrl: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
            city: string | null;
            state: string | null;
            cnpj: string | null;
            portalAtivo: boolean;
            portalDescricao: string | null;
            portalCorPrimaria: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        name: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        isActive: boolean;
        organizationId: number | null;
    }>;
    remove(id: number, orgId: number | undefined): Promise<{
        organization: {
            id: number;
            slug: string;
            name: string;
            description: string | null;
            website: string | null;
            logoUrl: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
            city: string | null;
            state: string | null;
            cnpj: string | null;
            portalAtivo: boolean;
            portalDescricao: string | null;
            portalCorPrimaria: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        name: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        isActive: boolean;
        organizationId: number | null;
    }>;
}
