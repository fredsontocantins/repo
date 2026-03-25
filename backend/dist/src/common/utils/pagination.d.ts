export type PaginationInput = {
    page?: number | string;
    limit?: number | string;
};
export declare function toPositiveInt(value: number | string | undefined, fallback: number): number;
export declare function normalizePagination(input?: PaginationInput, defaultLimit?: number): {
    page: number;
    limit: number;
    skip: number;
};
