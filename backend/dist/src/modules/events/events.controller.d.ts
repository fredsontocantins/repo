import { EventsService } from './events.service';
export declare class EventsController {
    private eventsService;
    constructor(eventsService: EventsService);
    findAll(user: any, status?: string, page?: number): Promise<{
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
    findOne(id: number, user: any): Promise<{
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
    create(user: any, body: any): Promise<{
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
    update(id: number, user: any, body: any): Promise<{
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
    register(id: number, user: any, volunteerId: number): Promise<{
        id: number;
        createdAt: Date;
        volunteerId: number;
        checkedIn: boolean;
        checkinAt: Date | null;
        eventId: number;
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
        createdAt: Date;
        volunteerId: number;
        checkedIn: boolean;
        checkinAt: Date | null;
        eventId: number;
    })[]>;
    checkin(id: number, user: any, volunteerId: number): Promise<{
        id: number;
        createdAt: Date;
        volunteerId: number;
        checkedIn: boolean;
        checkinAt: Date | null;
        eventId: number;
    }>;
    unregisterVolunteer(id: number, volunteerId: number, user: any): Promise<{
        id: number;
        createdAt: Date;
        volunteerId: number;
        checkedIn: boolean;
        checkinAt: Date | null;
        eventId: number;
    }>;
}
