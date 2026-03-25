import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';
declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    organizationId?: number;
}
declare class UpdateUserDto {
    name?: string;
    email?: string;
    role?: UserRole;
    password?: string;
    isActive?: boolean;
}
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    private resolveOrg;
    list(user: any, page?: number, limit?: number, search?: string, orgId?: number): Promise<{
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
    detail(id: number, user: any, orgId?: number): Promise<{
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
    create(user: any, body: CreateUserDto): Promise<{
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
    update(id: number, user: any, body: UpdateUserDto, orgId?: number): Promise<{
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
    remove(id: number, user: any, orgId?: number): Promise<{
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
export {};
