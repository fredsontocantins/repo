import { GamificationService } from './gamification.service';
export declare class GamificationController {
    private service;
    constructor(service: GamificationService);
    getLeaderboard(user: any, limit?: number): Promise<{
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
    getStats(user: any): Promise<{
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
    getVolunteerBadges(id: number): Promise<({
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
    createBadge(body: any): Promise<{
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
    awardBadge(body: {
        volunteerId: number;
        badgeId: number;
    }): Promise<{
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
    checkAndAward(volunteerId: number): Promise<any[]>;
}
