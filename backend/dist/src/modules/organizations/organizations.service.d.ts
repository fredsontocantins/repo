import { PrismaService } from '../../prisma.service';
export declare class OrganizationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: number): Promise<{
        _count: {
            volunteers: number;
            campaigns: number;
            events: number;
            donations: number;
        };
    } & {
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
    }>;
    update(id: number, data: any): Promise<{
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
    }>;
    getDashboardStats(orgId: number): Promise<{
        volunteers: {
            total: number;
            active: number;
            totalHoras: number;
            newThisMonth: number;
        };
        campaigns: {
            total: number;
            active: number;
            totalArrecadado: number;
        };
        donations: {
            total: number;
            totalMonetario: number;
            newThisMonth: number;
        };
        events: {
            upcoming: number;
        };
    }>;
}
