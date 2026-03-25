import { CampaignsService } from './campaigns.service';
import { CampaignStatus } from '@prisma/client';
export declare class CampaignsController {
    private campaignsService;
    constructor(campaignsService: CampaignsService);
    findAll(user: any, status?: CampaignStatus, search?: string, page?: number): Promise<{
        data: ({
            _count: {
                volunteers: number;
                events: number;
                donations: number;
            };
        } & {
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
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getStats(user: any): Promise<{
        total: number;
        active: number;
        completed: number;
        totalArrecadado: number;
        totalMeta: number;
    }>;
    findOne(id: number, user: any): Promise<{
        volunteers: ({
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
        _count: {
            volunteers: number;
            donations: number;
        };
    } & {
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
    create(user: any, body: any): Promise<{
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
    update(id: number, user: any, body: any): Promise<{
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
    remove(id: number, user: any): Promise<{
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
    addVolunteer(id: number, user: any, volunteerId: number): Promise<{
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
    } & {
        id: number;
        volunteerId: number;
        joinedAt: Date;
        horasTrabalhadas: number;
        campaignId: number;
    }>;
    listVolunteers(id: number, user: any): Promise<({
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
    } & {
        id: number;
        volunteerId: number;
        joinedAt: Date;
        horasTrabalhadas: number;
        campaignId: number;
    })[]>;
    removeVolunteer(id: number, volunteerId: number, user: any): Promise<{
        id: number;
        volunteerId: number;
        joinedAt: Date;
        horasTrabalhadas: number;
        campaignId: number;
    }>;
}
