import { CampaignInterestsService } from './campaign-interests.service';
export declare class CampaignInterestsController {
    private service;
    constructor(service: CampaignInterestsService);
    list(user: any, status?: string, campaignId?: string, page?: number, limit?: number): Promise<{
        data: ({
            campaign: {
                id: number;
                nome: string;
            };
        } & {
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
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    detail(user: any, id: number): Promise<{
        campaign: {
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
        };
    } & {
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
    approve(user: any, id: number): Promise<{
        interest: {
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
        };
        volunteer: {
            id: number;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            avatarUrl: string | null;
            organizationId: number;
            nome: string;
            telefone: string | null;
            bio: string | null;
            cpf: string | null;
            dataNascimento: Date | null;
            profissao: string | null;
            habilidades: string[];
            endereco: string | null;
            cidade: string | null;
            estado: string | null;
            status: import(".prisma/client").$Enums.VolunteerStatus;
            pontos: number;
            horasContribuidas: number;
            publicProfile: boolean;
            userId: number | null;
        };
    }>;
    reject(user: any, id: number, motivo?: string): Promise<{
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
}
