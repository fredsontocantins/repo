import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        token: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
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
        };
    }>;
    register(body: {
        name: string;
        email: string;
        password: string;
        organizationId?: number;
    }): Promise<{
        token: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
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
        };
    }>;
    me(user: any): Promise<{
        id: number;
        name: string;
        email: string;
        createdAt: Date;
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
        role: import(".prisma/client").$Enums.UserRole;
    }>;
}
