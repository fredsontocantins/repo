import { PrismaService } from '../../prisma.service';
import { VolunteerStatus } from '@prisma/client';
export declare class VolunteersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(orgId: number, filters?: {
        status?: VolunteerStatus;
        search?: string;
        page?: number | string;
        limit?: number | string;
    }): Promise<{
        data: ({
            _count: {
                eventRegistrations: number;
            };
            badges: ({
                badge: {
                    id: number;
                    createdAt: Date;
                    nome: string;
                    descricao: string | null;
                    icone: string;
                    cor: string;
                    criterio: string | null;
                    pontosReq: number;
                    horasReq: number;
                };
            } & {
                id: number;
                earnedAt: Date;
                volunteerId: number;
                badgeId: number;
            })[];
        } & {
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
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: number, orgId: number): Promise<{
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
        eventRegistrations: ({
            event: {
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
            };
        } & {
            id: number;
            createdAt: Date;
            volunteerId: number;
            checkedIn: boolean;
            checkinAt: Date | null;
            eventId: number;
        })[];
        badges: ({
            badge: {
                id: number;
                createdAt: Date;
                nome: string;
                descricao: string | null;
                icone: string;
                cor: string;
                criterio: string | null;
                pontosReq: number;
                horasReq: number;
            };
        } & {
            id: number;
            earnedAt: Date;
            volunteerId: number;
            badgeId: number;
        })[];
        campaignVolunteers: ({
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
            volunteerId: number;
            joinedAt: Date;
            horasTrabalhadas: number;
            campaignId: number;
        })[];
    } & {
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
    }>;
    create(orgId: number, data: any): Promise<{
        badges: ({
            badge: {
                id: number;
                createdAt: Date;
                nome: string;
                descricao: string | null;
                icone: string;
                cor: string;
                criterio: string | null;
                pontosReq: number;
                horasReq: number;
            };
        } & {
            id: number;
            earnedAt: Date;
            volunteerId: number;
            badgeId: number;
        })[];
    } & {
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
    }>;
    update(id: number, orgId: number, data: any): Promise<{
        badges: ({
            badge: {
                id: number;
                createdAt: Date;
                nome: string;
                descricao: string | null;
                icone: string;
                cor: string;
                criterio: string | null;
                pontosReq: number;
                horasReq: number;
            };
        } & {
            id: number;
            earnedAt: Date;
            volunteerId: number;
            badgeId: number;
        })[];
    } & {
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
    }>;
    remove(id: number, orgId: number): Promise<{
        message: string;
    }>;
    getStats(orgId: number): Promise<{
        total: number;
        active: number;
        pending: number;
        inactive: number;
        totalHoras: number;
        topVolunteers: {
            id: number;
            avatarUrl: string;
            nome: string;
            pontos: number;
            horasContribuidas: number;
        }[];
        byProfissao: {
            profissao: string;
            count: number;
        }[];
    }>;
    addPoints(id: number, orgId: number, points: number): Promise<{
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
    }>;
}
