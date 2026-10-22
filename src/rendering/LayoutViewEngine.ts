import ejs from 'ejs';
import path from 'path';
import { ViewComposition } from './ViewComposition';

type RenderCallback = (error: Error | null, html?: string) => void;

interface ExpressRenderOptions extends Record<string, unknown> {
    settings?: { views?: string | string[] };
}

/** Protects against layouts extending each other in a circle */
const MAX_LAYOUT_DEPTH = 10;

/**
 * Express view engine for EJS with Blade-like layouts:
 * the view renders first, then the layout it extends (and the layout of that layout ...),
 * each level receiving the sections and stacks of the previous ones.
 * Views without `extend()` are rendered exactly as plain EJS.
 */
export class LayoutViewEngine {
    readonly render = (filePath: string, options: object, callback: RenderCallback): void => {
        this.renderWithLayouts(filePath, options as ExpressRenderOptions)
            .then(html => callback(null, html))
            .catch(error => callback(error));
    };

    private async renderWithLayouts(viewPath: string, options: ExpressRenderOptions): Promise<string> {
        const composition = new ViewComposition();
        const templateData = { ...options, ...composition.helpers() };
        let templatePath = viewPath;

        for (let depth = 0; depth <= MAX_LAYOUT_DEPTH; depth++) {
            const html = composition.collect(await ejs.renderFile(templatePath, templateData), templatePath);
            const layout = composition.takeLayout();

            if (!layout) {
                return html;
            }

            templatePath = this.resolveLayout(layout, options);
        }

        throw new Error(`Too many nested layouts (max ${MAX_LAYOUT_DEPTH}) rendering ${viewPath}`);
    }

    /** Layout names are relative to the views directory, like the names given to `res.render()` */
    private resolveLayout(layout: string, options: ExpressRenderOptions): string {
        const views = options.settings?.views;
        const viewsDirectory = Array.isArray(views) ? views[0] : views;

        if (!viewsDirectory) {
            throw new Error('The "views" setting is required to resolve the layouts');
        }

        return path.join(viewsDirectory, layout.endsWith('.ejs') ? layout : `${layout}.ejs`);
    }
}
