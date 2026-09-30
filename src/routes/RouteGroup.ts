import { Router } from 'express';

export abstract class RouteGroup {
    protected readonly router = Router();

    build(): Router {
        this.registerRoutes();
        return this.router;
    }

    protected abstract registerRoutes(): void;
}
