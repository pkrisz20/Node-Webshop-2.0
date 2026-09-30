export class Pagination {
    private constructor(
        readonly currentPage: number,
        readonly perPage: number,
    ) {}

    /** Reads the `?page=` query parameter, returns null when it is not a positive integer */
    static fromQuery(query: Record<string, unknown>, perPage: number): Pagination | null {
        const page = query.page === undefined ? 1 : Number(query.page);

        if (!Number.isInteger(page) || page <= 0) {
            return null;
        }

        return new Pagination(page, perPage);
    }

    get offset(): number {
        return (this.currentPage - 1) * this.perPage;
    }

    get limit(): number {
        return this.perPage;
    }

    pageCount(totalItems: number): number {
        return Math.ceil(totalItems / this.perPage);
    }
}
