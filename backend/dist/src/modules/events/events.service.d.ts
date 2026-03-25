import { PrismaService } from '../../prisma.service';
export declare class EventsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(orgId: number, filters?: {
        status?: string;
        page?: number | string;
        limit?: number | string;
    }): Promise<{
        data: ({
            _count: {
                registrations: number;
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
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: number, orgId: number): Promise<{
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
        registrations: ({
            volunteer: {
                id: number;
                email: string;
                nome: string;
            };
        } & {
            id: number;
            createdAt: Date;
            volunteerId: number;
            checkedIn: boolean;
            checkinAt: Date | null;
            eventId: number;
        })[];
    } & {
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
    }>;
    create(orgId: number, data: any): Promise<{
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
    }>;
    update(id: number, orgId: number, data: any): Promise<{
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
    }>;
    register(eventId: number, volunteerId: number, orgId: number): Promise<{
        id: number;
        createdAt: Date;
        volunteerId: number;
        checkedIn: boolean;
        checkinAt: Date | null;
        eventId: number;
    }>;
    listRegistrations(eventId: number, orgId: number): Promise<({
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
        createdAt: Date;
        volunteerId: number;
        checkedIn: boolean;
        checkinAt: Date | null;
        eventId: number;
    })[]>;
    unregister(eventId: number, volunteerId: number, orgId: number): Promise<{
        id: number;
        createdAt: Date;
        volunteerId: number;
        checkedIn: boolean;
        checkinAt: Date | null;
        eventId: number;
    }>;
    checkin(eventId: number, volunteerId: number, orgId: number): Promise<{
        id: number;
        createdAt: Date;
        volunteerId: number;
        checkedIn: boolean;
        checkinAt: Date | null;
        eventId: number;
    }>;
}
