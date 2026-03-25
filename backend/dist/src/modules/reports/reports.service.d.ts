import { PrismaService } from '../../prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(orgId: number): Promise<{
        id: number;
        createdAt: Date;
        organizationId: number;
        nome: string;
        tipo: string;
        filtros: import("@prisma/client/runtime/library").JsonValue | null;
        dados: import("@prisma/client/runtime/library").JsonValue | null;
        geradoPor: string | null;
    }[]>;
    generate(orgId: number, tipo: string, filtros: any, geradoPor: string): Promise<{
        id: number;
        createdAt: Date;
        organizationId: number;
        nome: string;
        tipo: string;
        filtros: import("@prisma/client/runtime/library").JsonValue | null;
        dados: import("@prisma/client/runtime/library").JsonValue | null;
        geradoPor: string | null;
    }>;
    private getTipoLabel;
    private buildVolunteersReport;
    private buildCampaignsReport;
    private buildDonationsReport;
    private buildEventsReport;
    private buildGeneralReport;
}
