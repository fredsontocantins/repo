import { PrismaService } from '../../prisma.service';
export declare class GamificationService {
    private prisma;
    constructor(prisma: PrismaService);
    getLeaderboard(orgId: number, limit?: number | string): Promise<{
        id: number;
        avatarUrl: string;
        nome: string;
        _count: {
            eventRegistrations: number;
        };
        profissao: string;
        pontos: number;
        horasContribuidas: number;
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
    }[]>;
    getBadges(): Promise<{
        id: number;
        createdAt: Date;
        nome: string;
        descricao: string | null;
        icone: string;
        cor: string;
        criterio: string | null;
        pontosReq: number;
        horasReq: number;
    }[]>;
    getVolunteerBadges(volunteerId: number): Promise<({
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
    })[]>;
    awardBadge(volunteerId: number, badgeId: number): Promise<{
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
    }>;
    checkAndAwardBadges(volunteerId: number): Promise<any[]>;
    createBadge(data: any): Promise<{
        id: number;
        createdAt: Date;
        nome: string;
        descricao: string | null;
        icone: string;
        cor: string;
        criterio: string | null;
        pontosReq: number;
        horasReq: number;
    }>;
    getStats(orgId: number): Promise<{
        totalPoints: number;
        totalBadgesAwarded: number;
        topBadges: {
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
            count: number;
        }[];
    }>;
}
