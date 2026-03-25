import { CertificatesService } from './certificates.service';
import { CertificateType } from '@prisma/client';
export declare class CertificatesController {
    private service;
    constructor(service: CertificatesService);
    verify(codigo: string): Promise<{
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
    findAll(user: any, volunteerId?: number, tipo?: CertificateType, page?: number): Promise<{
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
    getStats(user: any): Promise<{
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
    findOne(id: number, user: any): Promise<{
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
    create(user: any, body: any): Promise<{
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
    issueBulk(user: any, body: any): Promise<{
        total: number;
        emitidos: number;
        results: any[];
    }>;
    revoke(id: number, user: any, motivo: string): Promise<{
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
}
