import { PrismaService } from '../../prisma.service';
export declare class CampaignVolunteersService {
    private prisma;
    constructor(prisma: PrismaService);
    private ensureCampaign;
    listVolunteers(campaignId: number, orgId: number): Promise<({
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
    assignVolunteer(campaignId: number, volunteerId: number, orgId: number): Promise<{
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
    removeVolunteer(campaignId: number, volunteerId: number, orgId: number): Promise<{
        id: number;
        volunteerId: number;
        joinedAt: Date;
        horasTrabalhadas: number;
        campaignId: number;
    }>;
}
