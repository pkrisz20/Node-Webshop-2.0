import type { Request, Response } from 'express';
import { appConfig } from '../../config/app';
import { OrderPresenter } from '../../presenters/OrderPresenter';
import { OrderStatisticsService } from '../../services/OrderStatisticsService';
import type { PriceFormat } from '../../utils/PriceFormat';
import { AdminController } from './AdminController';

export class DashboardController extends AdminController {
    constructor(private readonly statisticsService = new OrderStatisticsService()) {
        super();
    }

    readonly loginPage = (req: Request, res: Response): void => {
        if (req.session.authenticated === true) {
            return res.redirect('/admin/dashboard');
        }

        res.render('admin/login', {
            meta: this.meta('Admin belépés', 'This is the Admin login page'),
        });
    };

    readonly dashboard = async (_req: Request, res: Response): Promise<void> => {
        res.render('admin/dashboard', {
            meta: this.meta('Admin dashboard', 'This is the Admin dashboard page'),
            ...await this.collectStatistics(res.locals.priceFormat),
        });
    };

    readonly statistics = async (_req: Request, res: Response): Promise<void> => {
        res.render('admin/statistics', {
            meta: this.meta('Statistics', 'This is the statistics admin page'),
            ...await this.collectStatistics(res.locals.priceFormat),
        });
    };

    private async collectStatistics(priceFormat: PriceFormat) {
        const currentYear = new Date().getFullYear();

        const [latestOrders, orderCounts, financesPerMonth, ordersCountPerMonth] = await Promise.all([
            this.statisticsService.latestOrders(appConfig.listLimits.dashboardLatestOrders),
            this.statisticsService.statusCounts(),
            this.statisticsService.monthlyRevenue(currentYear),
            this.statisticsService.monthlyOrderCounts(currentYear),
        ]);

        return {
            lastOrders: latestOrders.map(order => OrderPresenter.toListRow(order, priceFormat)),
            orderCounts,
            financesPerMonth,
            maxValueFromMonths: Math.max(...financesPerMonth),
            showFinances: financesPerMonth.some(total => total > 0),
            ordersCountPerMonth,
            maxValueordersCount: Math.max(...ordersCountPerMonth),
            showOrdersCount: ordersCountPerMonth.some(count => count > 0),
        };
    }
}
