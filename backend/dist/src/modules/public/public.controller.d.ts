import { PublicService } from './public.service';
export declare class PublicController {
    private service;
    constructor(service: PublicService);
    getOrg(slug: string): Promise<{
        id: number;
        slug: string;
        name: string;
        description: string;
        website: string;
        logoUrl: string;
        email: string;
        city: string;
        state: string;
        portalDescricao: string;
        portalCorPrimaria: string;
        _count: {
            volunteers: number;
            campaigns: number;
        };
    }>;
    getStats(slug: string): Promise<{
        voluntariosAtivos: number;
        campanhasAtivas: number;
        totalArrecadado: number;
        eventosAgendados: number;
        totalHoras: number;
    }>;
    getCampaigns(slug: string, destaque?: string, page?: number, limit?: number): Promise<{
        data: {
            id: number;
            nome: string;
            descricao: string;
            _count: {
                donations: number;
            };
            status: import(".prisma/client").$Enums.CampaignStatus;
            objetivo: string;
            metaArrecadacao: number;
            arrecadado: number;
            metaVoluntarios: number;
            voluntariosAtivos: number;
            dataInicio: Date;
            dataFim: Date;
            imagemUrl: string;
            destaque: boolean;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getEvents(slug: string, page?: number | string, limit?: number): Promise<{
        data: {
            id: number;
            nome: string;
            descricao: string;
            _count: {
                registrations: number;
            };
            status: import(".prisma/client").$Enums.EventStatus;
            dataInicio: Date;
            dataFim: Date;
            campaign: {
                id: number;
                nome: string;
            };
            local: string;
            capacidade: number;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getLeaderboard(slug: string, limit?: number): Promise<{
        id: number;
        avatarUrl: string;
        nome: string;
        profissao: string;
        pontos: number;
        horasContribuidas: number;
        badges: ({
            badge: {
                nome: string;
                icone: string;
                cor: string;
            };
        } & {
            id: number;
            earnedAt: Date;
            volunteerId: number;
            badgeId: number;
        })[];
    }[]>;
    expressInterest(slug: string, id: number, body: {
        nome: string;
        email: string;
        telefone?: string;
        profissao?: string;
        mensagem?: string;
    }): Promise<{
        id: number;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: number;
        nome: string;
        telefone: string | null;
        profissao: string | null;
        status: import(".prisma/client").$Enums.CampaignInterestStatus;
        campaignId: number;
        mensagem: string | null;
    }>;
    getCampaignDetail(slug: string, id: number): Promise<{
        featuredVolunteers: {
            id: number;
            avatarUrl: string;
            nome: string;
            profissao: string;
        }[];
        volunteers: ({
            volunteer: {
                id: number;
                avatarUrl: string;
                nome: string;
                profissao: string;
            };
        } & {
            id: number;
            volunteerId: number;
            joinedAt: Date;
            horasTrabalhadas: number;
            campaignId: number;
        })[];
        events: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            organizationId: number;
            nome: string;
            descricao: string | null;
            status: import(".prisma/client").$Enums.EventStatus;
            dataInicio: Date;
            dataFim: Date | null;
            imagemUrl: string | null;
            publicavel: boolean;
            campaignId: number | null;
            local: string | null;
            capacidade: number | null;
        }[];
        donations: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            organizationId: number;
            descricao: string | null;
            status: import(".prisma/client").$Enums.DonationStatus;
            volunteerId: number | null;
            campaignId: number | null;
            mensagem: string | null;
            tipo: import(".prisma/client").$Enums.DonationType;
            valor: number | null;
            doadorNome: string | null;
            doadorEmail: string | null;
            doadorTelefone: string | null;
            recibo: string | null;
        }[];
        id: number;
        createdAt: Date;
        updatedAt: Date;
        organizationId: number;
        nome: string;
        descricao: string | null;
        status: import(".prisma/client").$Enums.CampaignStatus;
        objetivo: string | null;
        metaArrecadacao: number | null;
        arrecadado: number;
        metaVoluntarios: number | null;
        voluntariosAtivos: number;
        dataInicio: Date | null;
        dataFim: Date | null;
        imagemUrl: string | null;
        publicavel: boolean;
        destaque: boolean;
    }>;
}
