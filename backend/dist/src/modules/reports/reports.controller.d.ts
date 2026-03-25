import { ReportsService } from './reports.service';
export declare class ReportsController {
    private service;
    constructor(service: ReportsService);
    findAll(user: any): Promise<{
        id: number;
        createdAt: Date;
        organizationId: number;
        nome: string;
        tipo: string;
        filtros: import("@prisma/client/runtime/library").JsonValue | null;
        dados: import("@prisma/client/runtime/library").JsonValue | null;
        geradoPor: string | null;
    }[]>;
    generate(user: any, body: {
        tipo: string;
        filtros?: any;
    }): Promise<{
        id: number;
        createdAt: Date;
        organizationId: number;
        nome: string;
        tipo: string;
        filtros: import("@prisma/client/runtime/library").JsonValue | null;
        dados: import("@prisma/client/runtime/library").JsonValue | null;
        geradoPor: string | null;
    }>;
}
