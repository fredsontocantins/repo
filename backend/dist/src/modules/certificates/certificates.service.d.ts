import { PrismaService } from '../../prisma.service';
import { CertificateType } from '@prisma/client';
export declare class CertificatesService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateCode;
    findAll(orgId: number, filters?: {
        volunteerId?: number;
        tipo?: CertificateType;
        page?: number | string;
        limit?: number | string;
    }): Promise<{
        data: ({
            volunteer: {
                id: number;
                email: string;
                nome: string;
                profissao: string;
            };
            campaign: {
                id: number;
                nome: string;
            };
        } & {
            id: number;
            createdAt: Date;
            organizationId: number;
            descricao: string | null;
            volunteerId: number;
            campaignId: number | null;
            tipo: import(".prisma/client").$Enums.CertificateType;
            codigo: string;
            titulo: string;
            horasCertificadas: number | null;
            dataAtividade: Date | null;
            dataEmissao: Date;
            dataValidade: Date | null;
            emitidoPor: string | null;
            assinante: string | null;
            cargoAssinante: string | null;
            revogado: boolean;
            motivoRevogacao: string | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: number, orgId: number): Promise<{
        organization: {
            id: number;
            name: string;
            logoUrl: string;
            email: string;
            city: string;
            state: string;
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
        organizationId: number;
        descricao: string | null;
        volunteerId: number;
        campaignId: number | null;
        tipo: import(".prisma/client").$Enums.CertificateType;
        codigo: string;
        titulo: string;
        horasCertificadas: number | null;
        dataAtividade: Date | null;
        dataEmissao: Date;
        dataValidade: Date | null;
        emitidoPor: string | null;
        assinante: string | null;
        cargoAssinante: string | null;
        revogado: boolean;
        motivoRevogacao: string | null;
    }>;
    verifyByCodigo(codigo: string): Promise<{
        valido: boolean;
        revogado: boolean;
        motivoRevogacao: string;
        certificado: {
            organization: {
                id: number;
                name: string;
                logoUrl: string;
                city: string;
                state: string;
            };
            volunteer: {
                id: number;
                nome: string;
                profissao: string;
            };
            campaign: {
                id: number;
                nome: string;
            };
        } & {
            id: number;
            createdAt: Date;
            organizationId: number;
            descricao: string | null;
            volunteerId: number;
            campaignId: number | null;
            tipo: import(".prisma/client").$Enums.CertificateType;
            codigo: string;
            titulo: string;
            horasCertificadas: number | null;
            dataAtividade: Date | null;
            dataEmissao: Date;
            dataValidade: Date | null;
            emitidoPor: string | null;
            assinante: string | null;
            cargoAssinante: string | null;
            revogado: boolean;
            motivoRevogacao: string | null;
        };
    }>;
    create(orgId: number, data: {
        volunteerId: number;
        tipo?: CertificateType;
        titulo: string;
        descricao?: string;
        horasCertificadas?: number;
        dataAtividade?: string;
        dataValidade?: string;
        campaignId?: number;
        assinante?: string;
        cargoAssinante?: string;
        emitidoPor?: string;
    }): Promise<{
        organization: {
            id: number;
            name: string;
        };
        volunteer: {
            id: number;
            email: string;
            nome: string;
        };
        campaign: {
            id: number;
            nome: string;
        };
    } & {
        id: number;
        createdAt: Date;
        organizationId: number;
        descricao: string | null;
        volunteerId: number;
        campaignId: number | null;
        tipo: import(".prisma/client").$Enums.CertificateType;
        codigo: string;
        titulo: string;
        horasCertificadas: number | null;
        dataAtividade: Date | null;
        dataEmissao: Date;
        dataValidade: Date | null;
        emitidoPor: string | null;
        assinante: string | null;
        cargoAssinante: string | null;
        revogado: boolean;
        motivoRevogacao: string | null;
    }>;
    issueBulk(orgId: number, data: {
        volunteerIds: number[];
        tipo?: CertificateType;
        titulo: string;
        descricao?: string;
        horasCertificadas?: number;
        campaignId?: number;
        assinante?: string;
        cargoAssinante?: string;
        emitidoPor?: string;
    }): Promise<{
        total: number;
        emitidos: number;
        results: any[];
    }>;
    revoke(id: number, orgId: number, motivoRevogacao: string): Promise<{
        id: number;
        createdAt: Date;
        organizationId: number;
        descricao: string | null;
        volunteerId: number;
        campaignId: number | null;
        tipo: import(".prisma/client").$Enums.CertificateType;
        codigo: string;
        titulo: string;
        horasCertificadas: number | null;
        dataAtividade: Date | null;
        dataEmissao: Date;
        dataValidade: Date | null;
        emitidoPor: string | null;
        assinante: string | null;
        cargoAssinante: string | null;
        revogado: boolean;
        motivoRevogacao: string | null;
    }>;
    getStats(orgId: number): Promise<{
        total: number;
        porTipo: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.CertificateGroupByOutputType, "tipo"[]> & {
            _count: number;
        })[];
        recentes: ({
            volunteer: {
                nome: string;
            };
            campaign: {
                nome: string;
            };
        } & {
            id: number;
            createdAt: Date;
            organizationId: number;
            descricao: string | null;
            volunteerId: number;
            campaignId: number | null;
            tipo: import(".prisma/client").$Enums.CertificateType;
            codigo: string;
            titulo: string;
            horasCertificadas: number | null;
            dataAtividade: Date | null;
            dataEmissao: Date;
            dataValidade: Date | null;
            emitidoPor: string | null;
            assinante: string | null;
            cargoAssinante: string | null;
            revogado: boolean;
            motivoRevogacao: string | null;
        })[];
    }>;
}
