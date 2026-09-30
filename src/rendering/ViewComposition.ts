import { randomBytes } from 'crypto';

type BlockKind = 'section' | 'push';

interface OpenBlock {
    kind: BlockKind;
    name: string;
}

/** Unique per process, so the page content can never forge a block marker */
const MARKER_TOKEN = randomBytes(8).toString('hex');

function marker(kind: BlockKind, edge: 'start' | 'end', name: string): string {
    return `<!--@${MARKER_TOKEN}:${kind}-${edge}:${name}-->`;
}

function blockPattern(kind: BlockKind): RegExp {
    return new RegExp(`<!--@${MARKER_TOKEN}:${kind}-start:([\\w.-]+)-->([\\s\\S]*?)<!--@${MARKER_TOKEN}:${kind}-end:\\1-->`, 'g');
}

const ANY_MARKER = new RegExp(`<!--@${MARKER_TOKEN}:`);

/**
 * Blade-like template inheritance state of one rendering.
 *
 * Views:   <%- extend('layouts/base') %>
 *          <%- section('content') %> ... <%- endSection() %>
 *          <%- push('scripts') %> ... <%- endPush() %>
 * Layouts: <%- yieldContent('content') %>, <%- stack('scripts') %>, hasSection('content')
 *
 * EJS can not capture the output between two tags, so `section()` and `push()` print markers
 * and the rendered HTML is split along them afterwards. This is why they need the `<%-` output tag.
 */
export class ViewComposition {
    private layout: string | null = null;
    private readonly sections = new Map<string, string>();
    private readonly stacks = new Map<string, string[]>();
    private readonly openBlocks: OpenBlock[] = [];
    private openedBlockCount = 0;

    /** Functions available in every template of the rendering (the includes share them) */
    helpers() {
        return {
            extend: (layout: string): string => {
                this.layout = layout;
                return '';
            },
            section: (name: string): string => this.open('section', name),
            endSection: (): string => this.close('section'),
            push: (name: string): string => this.open('push', name),
            endPush: (): string => this.close('push'),
            yieldContent: (name: string, fallback = ''): string => this.sections.get(name) ?? fallback,
            hasSection: (name: string): boolean => this.sections.has(name),
            stack: (name: string): string => (this.stacks.get(name) ?? []).join(''),
        };
    }

    /** The layout requested by the last rendered template, cleared for the next level */
    takeLayout(): string | null {
        const layout = this.layout;
        this.layout = null;
        return layout;
    }

    /**
     * Moves the pushed and the section contents of the rendered HTML into the composition,
     * returns the remaining HTML (the whole output of a template which does not use blocks).
     */
    collect(html: string, templatePath: string): string {
        this.assertAllBlocksPrinted(html, templatePath);

        const remaining = html
            .replace(blockPattern('push'), (_match, name: string, content: string) => {
                this.stacks.set(name, [...(this.stacks.get(name) ?? []), content]);
                return '';
            })
            .replace(blockPattern('section'), (_match, name: string, content: string) => {
                // The child view renders first, so its section wins over the same section of a parent layout
                if (!this.sections.has(name)) {
                    this.sections.set(name, content);
                }
                return '';
            });

        if (ANY_MARKER.test(remaining)) {
            throw new Error(`Unbalanced section() / push() blocks in ${templatePath}`);
        }

        return remaining;
    }

    private open(kind: BlockKind, name: string): string {
        const parent = this.openBlocks[this.openBlocks.length - 1];

        // A push can be placed into a section (e.g. by an included component), anything else can not be nested
        if (parent && !(kind === 'push' && parent.kind === 'section')) {
            throw new Error(`${kind}('${name}') can not be opened inside ${parent.kind}('${parent.name}')`);
        }

        this.openBlocks.push({ kind, name });
        this.openedBlockCount++;

        return marker(kind, 'start', name);
    }

    private close(kind: BlockKind): string {
        const block = this.openBlocks.pop();

        if (!block || block.kind !== kind) {
            throw new Error(`end${kind === 'section' ? 'Section' : 'Push'}() without an open ${kind}()`);
        }

        return marker(kind, 'end', block.name);
    }

    /** A block opened with `<% %>` instead of `<%- %>` prints no marker and its content would silently disappear */
    private assertAllBlocksPrinted(html: string, templatePath: string): void {
        const printedBlockCount = html.split(new RegExp(`<!--@${MARKER_TOKEN}:\\w+-start:`)).length - 1;

        if (this.openBlocks.length > 0) {
            const block = this.openBlocks[this.openBlocks.length - 1];
            throw new Error(`${block.kind}('${block.name}') is not closed in ${templatePath}`);
        }

        if (printedBlockCount !== this.openedBlockCount) {
            throw new Error(`Use the <%- %> tag for section() / push() / endSection() / endPush() in ${templatePath}`);
        }

        this.openedBlockCount = 0;
    }
}
