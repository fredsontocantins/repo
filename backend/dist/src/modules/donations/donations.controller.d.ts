import { DonationsService } from './donations.service';
import { DonationType, DonationStatus } from '@prisma/client';
export declare class DonationsController {
    private donationsService;
    constructor(donationsService: DonationsService);
    findAll(user: any, tipo?: DonationType, status?: DonationStatus, campaignId?: number, page?: number): Promise<{
        data: ({
            volunteer: {
                id: number;
                nome: string;
            };
            campaign: {
                id: number;
                nome: string;
            };
        } & {
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
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getStats(user: any): Promise<{
        total: number;
        totalMonetario: number;
        byTipo: {
            tipo: import(".prisma/client").$Enums.DonationType;
            count: number;
            total: number;
        }[];
        recentDonors: {
            createdAt: Date;
            campaign: {
                nome: string;
            };
            tipo: import(".prisma/client").$Enums.DonationType;
            valor: number;
            doadorNome: string;
        }[];
        monthlyTrend: unknown;
    }>;
    findOne(id: number, user: any): Promise<{
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
    }>;
    create(user: any, body: any): Promise<{
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
    }>;
    update(id: number, user: any, body: any): Promise<{
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
    }>;
}
