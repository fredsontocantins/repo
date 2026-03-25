import { OrganizationsService } from './organizations.service';
export declare class OrganizationsController {
    private service;
    constructor(service: OrganizationsService);
    findOne(user: any): Promise<{
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
    getDashboard(user: any): Promise<{
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
    update(user: any, body: any): Promise<{
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
}
