import { PrismaService } from '../../prisma.service';
import { CampaignVolunteersService } from '../campaign-volunteers/campaign-volunteers.service';
export declare class CampaignInterestsService {
    private prisma;
    private campaignVolunteersService;
    constructor(prisma: PrismaService, campaignVolunteersService: CampaignVolunteersService);
    private buildWhere;
    list(orgId: number, filters?: {
        page?: number | string;
        limit?: number | string;
        status?: string;
        campaignId?: number | string;
    }): Promise<{
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
    getById(orgId: number, id: number): Promise<{
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
    approve(orgId: number, id: number): Promise<{
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
    reject(orgId: number, id: number, motivo?: string): Promise<{
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
